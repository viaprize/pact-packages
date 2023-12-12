import { Api } from '@/lib/api';
import AmountDonateCard from './amount-donate-card';
import ImageTitleHeroCard from './image-title-hero-card';
import PortalTabs from './portal-tabs';
import { formatEther } from 'viem';

export default async function CreatePortal({ params }: { params: { id: string } }) {
  const portal = (await new Api().portals.portalsDetail(params.id)).data;
  console.log(portal)
  return (
    <div className="my-10 px-3 sm:px-6 md:px-14 lg:px-20">
      <div className="w-full lg:flex gap-4 justify-between">
        <ImageTitleHeroCard
          name={portal.user.name}
          title={portal.title}
          img={portal.images[0]}
        />
        <AmountDonateCard
          amountRaised={formatEther(BigInt(portal.balance))}
          recipientAddress={portal.contract_address}
          totalContributors={formatEther(BigInt(portal.totalFunds ?? 0))}
          contractAddress={portal.contract_address}
        />
      </div>
      <PortalTabs description={portal.description} />
    </div>
  );
}
