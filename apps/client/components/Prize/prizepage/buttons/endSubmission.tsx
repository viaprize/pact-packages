import { TransactionToast } from '@/components/custom/transaction-toast';
import { backendApi } from '@/lib/backend';
import { Button } from '@mantine/core';
import { useMutation } from 'react-query';
import { toast } from 'sonner';

export default function EndSubmission({ contractAddress }: { contractAddress: string }) {
  const { mutateAsync, isLoading } = useMutation(
    async () => {
      return await (await backendApi()).wallet.prizeEndSubmissionCreate(contractAddress);
    },
    {
      onSuccess: async (data) => {
        toast.success(
          <TransactionToast title="Submission Ending" hash={data.data.hash} />,
        );
        window.location.reload();
      },
    },
  );
  return (
    <Button
      fullWidth
      my="md"
      loading={isLoading}
      onClick={async () => {
        const result = await mutateAsync?.();
        console.log(result);
      }}
    >
      {' '}
      End Submission
    </Button>
  );
}
