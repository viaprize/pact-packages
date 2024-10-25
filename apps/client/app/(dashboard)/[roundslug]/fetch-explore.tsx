import GitcoinCard from '@/components/gitcoin/gitcoin-card';
import { fetchRoundForExplorer } from '@/lib/actions';
import { gitcoinRounds } from '@/lib/constants';
import { notFound } from 'next/navigation';
import type { Application } from 'types/gitcoin.types';

export const dynamic = 'force-dynamic';
function shuffleArray<T>(array: T[]): T[] {
  const arrayCopy = [...array];
  return arrayCopy.sort(() => Math.random() - 0.5);
}

export default async function FetchGitcoins({
  params,
}: {
  params: { roundslug: string };
}) {
  const getIds = gitcoinRounds.find((round) => round.roundSlug === params.roundslug);

  if (!getIds) {
    return notFound();
  }

  const applicationsInRound = await fetchRoundForExplorer(getIds.chainId, getIds.roundId);
  const shuffledApplications: Application[] = shuffleArray(
    applicationsInRound.applications,
  );

  return (
    <>
      {shuffledApplications.length === 0 && (
        <>
          <span />
          <div className="flex justify-center items-center h-[50vh] w-full">
            <h3>No Applications Found</h3>
          </div>
        </>
      )}
      {shuffledApplications.map((application: Application) => (
        <GitcoinCard
          id={application.id}
          key={application.id}
          roundSlug={params.roundslug}
          imageURL={
            application.project.metadata.bannerImg
              ? `https://gitcoin.mypinata.cloud/ipfs/${application.project.metadata.bannerImg}`
              : '/bgimagenotfound.jpg'
          }
          title={application.project.metadata.title}
          description={application.project.metadata.description}
          raised={application.totalAmountDonatedInUsd}
          contributors={application.uniqueDonorsCount}
          link={`${params.roundslug}/${application.id}`}
          application={application}
          logoURL={`https://gitcoin.mypinata.cloud/ipfs/${application.project.metadata.logoImg}`}
        />
      ))}
    </>
  );
}
