import { env } from '@/env'
import { NORMIE_TECH_URL } from '@/lib/constant'
import { viaprize } from '@/server/viaprize'
import type { ExtraMetadata } from '@/types/payment'
import { wallets } from '@viaprize/core/database/schema/wallets'
import { normieTechClient, type paths } from '@viaprize/core/normie-tech'
import { Events } from '@viaprize/core/viaprize'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true })
}
