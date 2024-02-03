import { Api } from '@/lib/api';
import React from 'react';
import AddUpdateCard from './add-update';

export default async function AddUpdate({ params }: { params: { id: string } }) {
  const portal = (
    await new Api().portals.portalsDetail(params.id, {
      next: {
        revalidate: 0,
      },
    })
  ).data;

  return (
    <section className='p-9 w-full'>
      <AddUpdateCard params={params} portal={portal} />
    </section>
  );
}
