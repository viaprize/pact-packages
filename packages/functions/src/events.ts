import {
  CONTRACT_CONSTANTS_PER_CHAIN,
  type ValidChainIDs,
} from "@viaprize/core/lib/constants";
import { Events, Viaprize } from "@viaprize/core/viaprize";
import { addDays, addMinutes, subMinutes } from "date-fns";
import { Resource } from "sst";
import { bus } from "sst/aws/bus";
import { Cache } from "./utils/cache";
import { schedule } from "./utils/schedule";

const viaprize = new Viaprize({
  config: {
    databaseUrl: process.env.DATABASE_URL ?? "",
    inMemoryDb: false,
    mode: "development",
    wallet: {
      walletPaymentInfraUrl: process.env.WALLET_PAYMENT_INFRA_API ?? "",
      walletApiKey: process.env.WALLET_API_KEY ?? "",
      rpcUrl: process.env.RPC_URL ?? "",
    },
    chainId: Number.parseInt(process.env.CHAIN_ID ?? "10"),
  },
});

const cache = new Cache();

export const handler = bus.subscriber(
  [
    Events.Wallet.Transaction,
    Events.Prize.Approve,
    Events.Cache.Set,
    Events.Cache.Delete,
    Events.Indexer.ConfirmEvent,
    Events.Prize.ScheduleStartSubmission,
    Events.Prize.ScheduleEndSubmissionAndStartVoting,
    Events.Prize.ScheduleEndVoting,
    Events.Prize.ScheduleEndDispute,
  ],
  async (event) => {
    switch (event.type) {
      case "wallet.transaction": {
        console.log("Processing wallet transaction event");
        const hash = await viaprize.wallet.sendTransaction(
          event.properties.transactions,
          event.properties.walletType
        );
        console.log("Transaction hash", hash);
        break;
      }
      case "prize.approve": {
        console.log("Processing prize approve event");
        const contract = await viaprize.prizes.approveDeployedPrize(
          event.properties.prizeId,
          event.properties.contractAddress
        );

        console.log("Contract", contract);
        if (contract) {
          const prize = await viaprize.prizes.getPrizeById(
            event.properties.prizeId
          );
          if (prize?.submissionDurationInMinutes) {
            await bus.publish(
              Resource.EventBus.name,
              Events.Prize.ScheduleStartSubmission,
              {
                contractAddress: event.properties.contractAddress.toLowerCase(),
                submissionDurationInMinutes: prize.submissionDurationInMinutes,
                startSubmissionDate: prize.startSubmissionDate,
              }
            );
          }
          if (prize?.votingDurationInMinutes) {
            await bus.publish(
              Resource.EventBus.name,
              Events.Prize.ScheduleEndSubmissionAndStartVoting,
              {
                contractAddress: event.properties.contractAddress.toLowerCase(),
                submissionDurationInMinutes: prize.submissionDurationInMinutes,
                startSubmissionDate: prize.startSubmissionDate,
                votingDurationInMinutes: prize.votingDurationInMinutes,
              }
            );
            await bus.publish(
              Resource.EventBus.name,
              Events.Prize.ScheduleEndVoting,
              {
                contractAddress: event.properties.contractAddress.toLowerCase(),
                startVotingDate: prize.startVotingDate,
                votingDurationInMinutes: prize.votingDurationInMinutes,
              }
            );
          }
        }

        await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
          key: viaprize.prizes.getCacheTag("PENDING_PRIZES"),
        });
        await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
          key: viaprize.prizes.getCacheTag("DEPLOYED_PRIZES"),
        });
        await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
          key: viaprize.prizes.getCacheTag("ACTIVE_PRIZES_COUNT"),
        });

        break;
      }
      case "cache.set":
        console.log("Processing cache set event");
        switch (event.properties.type) {
          case "dynamodb": {
            await cache.set(
              event.properties.key,
              event.properties.value,
              event.properties.ttl ?? 3600
            );
            break;
          }
        }
        break;
      case "cache.delete":
        console.log("Processing cache delete event");
        await cache.delete(event.properties.key);
        break;
      case "indexer.confirmEvent":
        console.log("Processing indexer confirm event");
        await viaprize.indexerEvents.createEvent(event.properties.eventId);
        break;
      case "prize.scheduleStartSubmission": {
        console.log("Processing prize scheduleStartSubmission event");
        const data = await viaprize.prizes.getEncodedStartSubmission(
          event.properties.contractAddress,
          {
            submissionDurationInMinutes:
              event.properties.submissionDurationInMinutes,
          }
        );
        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `StartSubmission-${event.properties.contractAddress}`,
          payload: JSON.stringify({
            type: "wallet.transaction",
            body: {
              transactions: [
                {
                  data,
                  to: event.properties.contractAddress,
                  value: "0",
                },
              ],
              walletType: "gasless",
            } as typeof Events.Wallet.Transaction.$input,
          }),
          triggerDate: new Date(event.properties.startSubmissionDate),
        });
        break;
      }
      case "prize.scheduleEndSubmissionAndStartVoting": {
        const data =
          await viaprize.prizes.getEncodedEndSubmissionAndStartVoting(
            event.properties.contractAddress,
            {
              votingDurationInMinutes: event.properties.votingDurationInMinutes,
            }
          );

        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `EndSubStartVoting-${event.properties.contractAddress}`,
          payload: JSON.stringify({
            type: "wallet.transaction",
            body: {
              transactions: [
                {
                  data: data.endSubmissionPeriodData,
                  to: event.properties.contractAddress,
                  value: "0",
                },
                {
                  data: data.startVotingPeriodData,
                  to: event.properties.contractAddress,
                  value: "0",
                },
              ],
              walletType: "gasless",
            } as typeof Events.Wallet.Transaction.$input,
          }),
          triggerDate: addMinutes(
            event.properties.startSubmissionDate,
            event.properties.submissionDurationInMinutes
          ),
        });
        break;
      }
      case "prize.scheduleEndVoting": {
        const data = await viaprize.prizes.getEncodedEndVoting();
        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `EndVoting-${event.properties.contractAddress}`,
          payload: JSON.stringify({
            type: "wallet.transaction",
            body: {
              transactions: [
                {
                  data,
                  to: event.properties.contractAddress,
                  value: "0",
                },
              ],
              walletType: "gasless",
            } as typeof Events.Wallet.Transaction.$input,
          }),
          triggerDate: addMinutes(
            event.properties.startVotingDate,
            event.properties.votingDurationInMinutes
          ),
        });
        break;
      }
      case "prize.scheduleEndDispute": {
        const prize = await viaprize.prizes.getPrizeByContractAddress(
          event.properties.contractAddress
        );
        const data = await viaprize.prizes.getEncodedEndDispute();
        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `EndDispute-${prize.id}`,
          payload: JSON.stringify({
            type: "wallet.transaction",
            body: {
              transactions: [
                {
                  data,
                  to: event.properties.contractAddress,
                  value: "0",
                },
              ],
              walletType: "gasless",
            } as typeof Events.Wallet.Transaction.$input,
          }),
          triggerDate: addDays(new Date(), 2),
        });
        break;
      }
    }
  }
);
