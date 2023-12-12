import useAppUser from '@/context/hooks/useAppUser';
import {
  ActionIcon,
  Button,
  Card,
  CopyButton,
  Divider,
  Flex,
  Menu,
  Stack,
  Text,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useWallets } from '@privy-io/react-auth';
import { IconCheck, IconCopy, IconMoonStars, IconSun } from '@tabler/icons-react';
import Link from 'next/link';

// function getEmailInitials(email: string) {
//   const [username, domain] = email.split('@');
//   if (!username || !domain) {
//     return '??';
//   }
//   const usernameInitial = username.charAt(0);
//   const domainInitial = domain.charAt(0);

//   return usernameInitial + domainInitial;
// }

export default function HeaderLayout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { wallets } = useWallets();
  const displayAddress = (address: string) => {
    return `${address.slice(0, 4)}....${address.slice(-4)}`;
  };
  const { appUser } = useAppUser();
  const [portalOpened, { close: portalMenuClose, open: portalMenuOpen }] =
    useDisclosure(false);
  const [prizeOpened, { close: prizeMenuClose, open: prizeMenuOpen }] =
    useDisclosure(false);

  return (
    <Flex
      ml="md"
      justify="space-between"
      align="center"
      visibleFrom="sm"
      className="w-[90%]"
      pr="md"
    >
      <Flex gap="xl">
        <Link href="/" className="font-bold">
          HOME
        </Link>
        <Menu withArrow shadow="md" position="bottom" trigger="hover">
          <Menu.Target>
            <Link href="/prize/explore" className="pl-3 font-bold">
              PRIZE
            </Link>
          </Menu.Target>
          <Menu.Dropdown>
            <Stack gap="md" p="md">
              <Menu.Item>
                <Link href="/prize/about">
                  <Text>About</Text>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link href="/prize/explore">
                  <Text>Explore Prizes</Text>
                </Link>
              </Menu.Item>
              <Divider />
              <Button>
                <Link href="/prize/create">Create Prize</Link>
              </Button>
            </Stack>
          </Menu.Dropdown>
        </Menu>

        <Menu withArrow shadow="md" position="bottom" trigger="hover">
          <Menu.Target>
            <Link href="/portal/explore" className="pl-3 font-bold">
              PORTALS
            </Link>
          </Menu.Target>
          <Menu.Dropdown>
            <Stack gap="md" p="md">
              <Menu.Item>
                <Link href="/portal/about">
                  <Text>About</Text>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link href="/portal/explore">
                  <Text>Explore Portals</Text>
                </Link>
              </Menu.Item>
              <Divider />
              <Button>
                <Link href="/portal/create">Create Portal</Link>
              </Button>
            </Stack>
          </Menu.Dropdown>
        </Menu>
      </Flex>

      <Flex gap="md" align="center">
        <Card className="hidden sm:block py-1 my-2">
          {wallets[0] ? displayAddress(wallets[0].address) : 'No Wallet'}
          {wallets[0] ? (
            <CopyButton value={wallets[0].address}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                  <ActionIcon
                    ml="md"
                    onClick={copy}
                    style={{
                      backgroundColor: copied ? '#3d4070' : '#3d4070',
                    }}
                  >
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          ) : null}
        </Card>

        <ActionIcon
          variant="outline"
          color={colorScheme === 'dark' ? 'yellow.7' : 'blue.8'}
          onClick={() => {
            toggleColorScheme();
          }}
          title="Toggle color scheme"
        >
          {colorScheme === 'dark' ? (
            <IconSun size="1.1rem" />
          ) : (
            <IconMoonStars size="1.1rem" />
          )}
        </ActionIcon>
      </Flex>
    </Flex>
  );
}
