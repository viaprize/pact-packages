import { Badge, Button, Card, Divider, Flex, Text } from '@mantine/core';
import { IconCurrencyEthereum } from '@tabler/icons-react';

export default function AmountDonateCard() {
  return (
    <Card
      p="md"
      radius="md"
      shadow="md"
      withBorder
      className="flex flex-col justify-between lg:max-w-[300px] my-3 lg:my-0"
    >
      <div>
        <Badge color="gray" variant="light" radius="sm" mb="sm">
          Total Amount Raised
        </Badge>
        <Text fw="bold" c="blue" className="lg:text-5xl md:4xl ">
          $500
        </Text>
        <Text size="sm" c="gray">
          Raised from{'  '}
          <span className="text-dark font-bold">80 </span>
          contributions
        </Text>
        <Text className="border-2 rounded-lg mt-2 ">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam voluptatibus,
          quas, quae, quos voluptatem amet voluptatum dolorum
        </Text>
      </div>
      <Text>Project Recipient Address</Text>
      <Divider />
      <Badge  color="gray" p="md">
        <Flex gap="md">
          <Text size="sm">0x62e9a8374AE3c</Text>
          <IconCurrencyEthereum size={20} />
        </Flex>
      </Badge>
      <Button color="primary">Donate</Button>
    </Card>
  );
}