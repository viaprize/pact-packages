import {
  http,
  type Abi,
  type ContractEventName,
  ParseEventLogsParameters,
  type ParseEventLogsReturnType,
  type TransactionReceipt,
  createPublicClient,
  parseEventLogs,
} from 'viem'
import { call, waitForTransactionReceipt } from 'viem/actions'
import { PRIZE_FACTORY_ABI } from './abi'
import { Blockchain } from './smart-contracts/blockchain'
import { getChain } from './utils'

export type WalletType = 'reserve' | 'gasless'
export type AddressType = 'signer' | 'vault'

type TransactionData = {
  to: string
  value: string
  data: string
}

export class Wallet extends Blockchain {
  url: string
  walletApiKey: string
  constructor(
    url: string,
    rpcUrl: string,
    chainId: number,
    walletApiKey: string,
  ) {
    super(rpcUrl, chainId)
    this.walletApiKey = walletApiKey
    this.url = url
  }
  async generateWallet() {
    // Generate a wallet
    const res: { address: string; key: string } = (await (
      await fetch(this.url + '/wallet/generate')
    ).json()) as any
    return res
  }
  async withTransactionEvents<
    abi extends Abi | readonly unknown[],
    eventName extends
      | ContractEventName<abi>
      | ContractEventName<abi>[]
      | undefined = undefined,
  >(
    abi: abi,
    tx: TransactionData[],
    type: WalletType,
    events:
      | eventName
      | ContractEventName<abi>
      | ContractEventName<abi>[]
      | undefined,
    callback: (
      event: ParseEventLogsReturnType<abi, eventName>,
      tx: TransactionReceipt,
    ) => Awaited<void>,
  ) {
    const transaction = await this.sendTransaction(tx, type)
    console.log({ transaction })
    await callback(
      parseEventLogs({ logs: transaction.logs, abi, eventName: events }),
      transaction,
    )
    return transaction
  }

  async simulateTransaction(
    tx: TransactionData,
    type: WalletType,
    addressType: AddressType,
  ) {
    const address = await this.getAddress(type, addressType)
    const res = await this.blockchainClient.call({
      account: address as `0x${string}`,
      to: tx.to as `0x${string}`,
      value: BigInt(tx.value),
      data: tx.data as `0x${string}`,
    })
    return res.data
  }
  async signVoteForCustodial({
    amount,
    contractAddress,
    encryptedKey,
    submissionHash,
  }: {
    amount: number
    contractAddress: `0x${string}`
    encryptedKey: `0x${string}`
    submissionHash: `0x${string}`
  }) {
    const res = await (
      await fetch(`${this.url}/wallet/sign-vote`, {
        body: JSON.stringify({
          amount,
          spender: contractAddress,
          key: encryptedKey,
          submissionHash,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.walletApiKey,
          'x-chain-id': this.chainId.toString(),
        },
        method: 'POST',
      })
    )
      .json()
      .then((res) => {
        console.log({ res })
        return {
          hash: (res as any).hash as string,
          signature: (res as any).signature as string,
        }
      })
    return res
  }

  async signUsdcTransactionForCustodial({
    spender,
    key,
    value,
    deadline,
  }: { spender: `0x${string}`; key: string; value: number; deadline: number }) {
    const res = await (
      await fetch(`${this.url}/wallet/sign-usdc`, {
        body: JSON.stringify({
          spender,
          value,
          key,
          deadline,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.walletApiKey,
          'x-chain-id': this.chainId.toString(),
        },
        method: 'POST',
      })
    )
      .json()
      .then((res) => {
        console.log({ res })
        return {
          hash: (res as any).hash as string,
          signature: (res as any).signature as string,
        }
      })
    return res
  }

  async sendTransaction(tx: TransactionData[], type: WalletType) {
    const transactionHash = await (
      await fetch(`${this.url}/${type}`, {
        body: JSON.stringify(tx),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.walletApiKey,
          'x-chain-id': this.chainId.toString(),
        },
        method: 'POST',
      })
    )
      .json()
      .then((res) => {
        console.log(`Transaction hash: ${(res as any).hash}`)
        return (res as any).hash as string
      })
      .catch((e) => {
        console.error(e)
        throw e
      })
    const receipt = await this.blockchainClient.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`,
    })

    return receipt
  }

  async getAddress(type: WalletType, addressType: AddressType) {
    // Get the wallet address
    const res: { address: string } = (await (
      await fetch(
        this.url +
          `/${type}${addressType === 'signer' ? '/signer' : '/address'}`,
      )
    ).json()) as any

    return res.address
  }
}
