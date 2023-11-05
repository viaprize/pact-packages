import { PrizeProposals } from '@/lib/api';
import { useViaPrizeFactoryCreateViaPrize } from '@/lib/smartContract';
import { ProposalStatus } from '@/lib/types';
import { Box, Button, Group, Menu, SimpleGrid, Text } from '@mantine/core';
import {
  IconArrowsLeftRight,
  IconMessageCircle,
  IconPhoto,
  IconSearch,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { waitForTransaction } from '@wagmi/core';
import { useRef } from 'react';
import { useAccount } from 'wagmi';
import ProposalExploreCard from '../ExplorePrize/proposalExploreCard';
export default function ProposalsTabs({
  data,
  isSuccess,
}: {
  data?: PrizeProposals[];
  isSuccess: boolean;
}) {
  console.log(data, 'data');
  const { address } = useAccount();
  const currentTimestamp = useRef(Date.now());

  const {
    data: prizeContract,

    writeAsync,
  } = useViaPrizeFactoryCreateViaPrize({
    account: address,
  });

  console.log(prizeContract, 'prizeContract');

  const getProposalStatus = (item: PrizeProposals): ProposalStatus => {
    if (data) {
      if (item.isApproved) {
        return 'approved';
      } else if (item.isRejected) {
        return `rejected`;
      }
      return 'pending';
    }
    return 'pending';
  };
  return (
    <Box p="md">
      <Group justify="space-between" px="md">
        <Text w={600} size="lg">
          Submitted Proposals
        </Text>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button>All Categories</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Application</Menu.Label>
            <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
            <Menu.Item leftSection={<IconMessageCircle size={14} />}>Messages</Menu.Item>
            <Menu.Item leftSection={<IconPhoto size={14} />}>Gallery</Menu.Item>
            <Menu.Item leftSection={<IconSearch size={14} />}>Search</Menu.Item>

            <Menu.Divider />

            <Menu.Label>Danger zone</Menu.Label>
            <Menu.Item leftSection={<IconArrowsLeftRight size={14} />}>
              Transfer my data
            </Menu.Item>
            <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
              Delete my account
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <SimpleGrid cols={3} my="md">
        {isSuccess ? (
          data?.map((item) => (
            <ProposalExploreCard
              status={getProposalStatus(item)}
              key={item.id}
              imageUrl={item.images[0]}
              description={item.description}
              onStatusClick={async (status) => {
                switch (status) {
                  case 'pending': {
                    console.log('pending');
                    break;
                  }
                  case 'approved': {
                    console.log('approved');
                    console.log(
                      [
                        item?.admins as `0x${string}`[],
                        [
                          '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
                          '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
                        ] as `0x${string}`[],
                        BigInt(10),
                        BigInt(10),
                        '0x62e9a8374AE3cdDD0DA7019721CcB091Fed927aE' as `0x${string}`,
                      ],
                      'args',
                    );

                    const out = await writeAsync({
                      args: [
                        item?.admins as `0x${string}`[],
                        [
                          '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
                          '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
                        ] as `0x${string}`[],
                        BigInt(10),
                        BigInt(10),
                        '0x62e9a8374AE3cdDD0DA7019721CcB091Fed927aE' as `0x${string}`,
                        BigInt(currentTimestamp.current),
                      ],
                    });
                    console.log(out, 'out');
                    const waitForTransactionOut = await waitForTransaction({
                      hash: out.hash,
                      confirmations: 1,
                    });
                    console.log(waitForTransactionOut.logs[0].topics[2]);
                    const prizeAddress =
                      '0x' + waitForTransactionOut.logs[0].topics[2]?.slice(-40);
                    console.log(prizeAddress, 'prizeAddress');

                    break;
                  }
                  case 'rejected': {
                    console.log('rejected');

                    break;
                  }
                  default:
                    break;
                }
              }}
              profileName={item.user.username}
              title={item.title}
            />
          ))
        ) : (
          <Text>No Proposals</Text>
        )}
      </SimpleGrid>
    </Box>
  );
}
