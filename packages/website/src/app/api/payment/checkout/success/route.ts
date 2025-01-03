import { env } from '@/env'
import { NORMIE_TECH_URL } from '@/lib/constant'
import { viaprize } from '@/server/viaprize'
import type { ExtraMetadata } from '@/types/payment'
import { normieTechClient, type paths } from '@viaprize/core/normie-tech'
import { Events } from '@viaprize/core/viaprize'
import { type NextRequest, NextResponse } from 'next/server'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  await bus.publish(Resource.EventBus.name, Events.Wallet.Transaction, {
    walletType: 'gasless',
    transactions: [
      {
        data: '0x',
        to: '0xC0Ba8eF6ED13A3eBAFa9497bBB6C97db336c5bD4',
        value: '100000000000000',
      },
    ],
  })
  return NextResponse.json({ success: true })
}
