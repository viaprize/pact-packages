import { User } from '@/lib/api';
import { Badge, Button, Card, Group, Image, Modal, Text, Textarea } from '@mantine/core';
import { useState } from 'react';
import { useMutation } from 'react-query';
import usePrizeProposal from '../hooks/usePrizeProposal';
import ViewDetails from './details';

interface AdminCardProps {
  images: string[];
  user: User;
  title: string;
  description: string;
  admins: string[];
  voting: number;
  submission: number;
  id: string;
}

const AdminCard: React.FC<AdminCardProps> = ({
  id,
  images,
  admins,
  description,
  submission,
  title,
  user,
  voting,
}) => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const { acceptProposal, rejectProposal } = usePrizeProposal();
  const acceptProposalMutation = useMutation(acceptProposal);
  const rejectProposalMutation = useMutation(rejectProposal);

  console.log({ images }, 'in admin card');
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder my="md">
        <Card.Section>
          {images.length > 0
            ? images.map((image) => (
              <Image src={image} height={160} alt="Image" key={image} width={346} />
            ))
            : null}
        </Card.Section>
        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>{title}</Text>
          <Badge color="gray" variant="light">
            {user.name}
          </Badge>
        </Group>
        <p className="text-md text-gray-500 max-h-14 overflow-y-auto">
          Click on View Details to See Description
        </p>
        <Group justify="space-evenly" mt="md" mb="xs">
          <Text fw={500} color="red">
            Submission Days is {submission} Days
          </Text>
          <Button
            onClick={() => {
              setDetailsOpen(true);
            }}
          >
            View Details
          </Button>
        </Group>
        <Modal
          size="xl"
          opened={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
          }}
          title="Prize details"
        >
          <ViewDetails
            user={user}
            admins={admins}
            images={images}
            description={description}
            title={title}
            submission={submission}
            voting={voting}
          />
        </Modal>
        <Group>
          <Button
            color="red"
            onClick={() => {
              setRejectOpen(true);
            }}
          >
            Reject
          </Button>
          <Button
            color="green"
            loading={acceptProposalMutation.isLoading}
            onClick={async () => {
              await acceptProposalMutation.mutateAsync(id);
              window.location.reload();
            }}
          >
            Accept
          </Button>
        </Group>
      </Card>
      <Modal
        opened={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
        }}
        title="Write your rejection reason"
      >
        <Textarea
          placeholder="Your comment"
          label="Your comment"
          variant="filled"
          radius="md"
          withAsterisk
          value={comment}
          onChange={(event) => {
            setComment(event.currentTarget.value);
          }}
        />
        <Group justify="space-evenly" my="md">
          <Button
            onClick={() => {
              setRejectOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color="red"
            loading={rejectProposalMutation.isLoading}
            onClick={async () => {
              const res = await rejectProposalMutation.mutateAsync({
                proposalId: id,
                comment,
              });
              console.log({ res }, 'this is the res');
              window.location.reload();
              setRejectOpen(false);
            }}
          >
            Reject
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default AdminCard;
