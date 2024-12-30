import { env } from '@/env'
import { NORMIE_TECH_URL } from '@/lib/constant'
import { viaprize } from '@/server/viaprize'
import type { ExtraMetadata } from '@/types/payment'
import { normieTechClient, type paths } from '@viaprize/core/normie-tech'
import { type NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
type MetadataType =
  paths['/v1/viaprize/0/checkout']['post']['requestBody']['content']['application/json']['metadata']

export async function GET(request: NextRequest) {
  console.log('HIIIIII')

  const transactionId = request.nextUrl.searchParams.get('transactionId')
  console.log('transactionId', transactionId)
  console.log(!transactionId, 'tr')
  if (!transactionId) {
    return NextResponse.json({
      error: 'Transaction ID not found',
    })
  }

  const paymentDetails = await normieTechClient(NORMIE_TECH_URL).GET(
    '/v1/{projectId}/{paymentId}/transactions/{transactionId}',
    {
      params: {
        header: {
          'x-api-key': env.NORMIE_TECH_API_KEY,
        },
        path: {
          paymentId: 0,
          projectId: 'viaprize',
          transactionId,
        },
      },
    },
  )

  const donation =
    await viaprize.donations.getDonationByPaymentId(transactionId)
  if (paymentDetails.error || !paymentDetails.data) {
    return NextResponse.json({
      error: 'Transaction ID not found',
    })
  }
  if (
    !donation &&
    paymentDetails.data.metadataJson &&
    paymentDetails.data.extraMetadataJson
  ) {
    const metadata = JSON.parse(
      JSON.stringify(paymentDetails.data.metadataJson),
    ) as MetadataType
    const extraMetadata = JSON.parse(
      JSON.stringify(paymentDetails.data.extraMetadataJson),
    ) as ExtraMetadata
    await viaprize.prizes.addUsdcFunds({
      donor: metadata.userAddress,
      recipientAddress: metadata.contractAddress,
      isFiat: true,
      prizeId: extraMetadata.prizeId,
      username: extraMetadata.username,
      valueInToken: Number(paymentDetails.data.amountInToken),
      transactionId: paymentDetails.data.blockchainTransactionId,
      paymentId: transactionId,
    })
    return NextResponse.redirect(
      `/checkout/success?transactionId=${transactionId}`,
    )
  }
  return NextResponse.redirect(
    `/checkout/success?transactionId=${transactionId}`,
  )
}
