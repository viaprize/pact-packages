import { makeStorageClient } from '@/components/_providers/WebClient';
import { CreatePrizeProposalDto, PrizeProposals, PrzieQuery } from '@/lib/api';
import myAxios from '@/lib/axios';
import { backendApi } from '@/lib/backend';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any -- needed this for the function */
function objectToRecord(obj: Record<string, any>): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((record, [key, value]) => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment -- needed this for the function */
    record[key] = value.toString();
    return record;
  }, {});
}

async function storeFiles(files: File[]) {
  const client = makeStorageClient();
  const cid = await client.put(files);
  console.log('stored files with cid:', cid);
  if (!files[0]) {
    return '';
  }
  const url = `https://dweb.link/ipfs/${cid}/${files[0].name}`;
  console.log('URL of the uploaded image:', url);
  return url;
}

// const addProsposal = async (data: Proposal) => {

//   const finalData = {
//       ...data,
//       // files: await storeFiles(data.files),
//       files: ''
//       };
//   const response = await myAxios.post('/prizes/proposals', finalData);

//   return response.data;

//   // const files = await storeFiles(data.files);
//   // return files;

// };

// export const useAddProposal = () => {
//   return useMutation(addProsposal);
// };

export default function usePrizeProposal() {
  const [proposals] = useState<PrizeProposals[]>();
  const { user } = usePrivy();
  const addProposals = async (proposalDto: CreatePrizeProposalDto) => {
    const res = await (await backendApi()).prizes.proposalsCreate(proposalDto);
    return res;
  };

  const uploadImages = async (files: File[]) => {
    const images = await storeFiles(files);
    return images;
  };

  const getProposalsOfUser = async (
    queryParams: { limit: number; page: number } = {
      limit: 10,
      page: 1,
    },
  ) => {
    const record: Record<string, string> = objectToRecord(queryParams);
    const queryString = new URLSearchParams(record);
    if (!user) {
      // throw new Error('Privy User not available')
      return;
    }
    const res = await myAxios.get(
      `/prizes/proposals/user/${user.id}${queryString.toString()}`,
    );
    console.log('res', 'acxi0', res);
    return res.data as PrizeProposals[];
  };

  const getAllProposals = async (
    queryParam: PrzieQuery = {
      limit: 10,
      page: 1,
    },
  ) => {
    const res = await (
      await backendApi()
    ).prizes.proposalsList({
      limit: queryParam.limit,
      page: queryParam.page,
    });
    console.log({ res });
    console.log(res.data.data);
    return res.data.data;
  };

  const acceptProposal = async (proposalId: string) => {
    const res = await (await backendApi()).prizes.proposalsAcceptCreate(proposalId);
    return res.data;
  };
  const rejectProposal = async ({
    comment,
    proposalId,
  }: {
    proposalId: string;
    comment: string;
  }) => {
    console.log('loggg reject');
    const res = await (
      await backendApi()
    ).prizes.proposalsRejectCreate(proposalId, {
      comment,
    });
    console.log({ res }, 'res isn ajfslj');
    return res.data;
  };

  const getAcceptedProposals = async (
    queryParam: PrzieQuery = {
      limit: 10,
      page: 1,
    },
  ) => {
    const res = await (
      await backendApi()
    ).prizes.proposalsAcceptList({
      limit: queryParam.limit,
      page: queryParam.page,
    });
    console.log({ res });
    console.log(res.data.data);
    return res.data.data;
  };
  return {
    addProposals,
    uploadImages,
    proposals,
    getProposalsOfUser,
    getAllProposals,
    acceptProposal,
    rejectProposal,
    getAcceptedProposals,
  };
}
