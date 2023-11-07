import { SubmissionWithBlockchainData } from '@/lib/api';
import { Button, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import SubmissionsCard from './submissionsCard';

export default function Submissions({
  contractAddress,
  submissions,
  allowSubmission,
}: {
  contractAddress: string;
  submissions: SubmissionWithBlockchainData[];
  allowSubmission: boolean;
}) {
  const { query } = useRouter();
  return (
    <div className="w-full flex flex-col gap-3">
      {allowSubmission && (
        <Button
          component="a"
          w="40%"
          className="self-end"
          href={`/prize/${query.id as string}/editor?contract=${contractAddress}`}
        >
          Submit your work
        </Button>
      )}
      <Title order={3} style={{ textAlign: 'left' }}>
        Submissions
      </Title>
      {submissions.map((submission: SubmissionWithBlockchainData) => (
        <SubmissionsCard
          fullname={submission.user.name}
          contractAddress={contractAddress}
          hash={submission.submissionHash}
          submission={submission.submissionDescription}
          wallet={submission.submitterAddress}
          time={''}
          votes={submission.voting_blockchain}
          submissionId={submission.id}
          key={submission.id}
          description={submission.submissionDescription}
        />
      ))}
    </div>
  );
}
