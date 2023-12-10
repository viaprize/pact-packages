'use client';
import { Text } from '@mantine/core';
import { Suspense } from 'react';
import FetchPortals from './fetchportals';
import SkeletonLoad from './loading';

import SearchFiltersPortals from './search-filters-portals';
import PortalCard from './portal-card';
export default function ExplorePortal() {
  return (
    <div className="max-w-screen-xl">
      <Text size="25px" fw="bolder" mt="md" ml="md">
        Explore Portal
      </Text>
      <Text size="md" fw="initial" mt="xs" ml="md">
        you can explore portal and work on them
      </Text>
      <SearchFiltersPortals />
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4">
        <Suspense fallback={<SkeletonLoad />}>
          {/* @ts-expect-error Server Component */}
          <FetchPortals />
        </Suspense>
        <PortalCard
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum! Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum!"
          imageUrl="https://placehold.jp/24/3d4070/ffffff/1280x720.png?text=No%20Image"
          amountRaised="0"
          authorName="John Doe"
          totalContributors="0"
          title="Portal Title"
          id="1"
        />
       
      </div>
    </div>
  );
}
