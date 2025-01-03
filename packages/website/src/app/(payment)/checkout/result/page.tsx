import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { env } from '@/env'
import { NORMIE_TECH_URL } from '@/lib/constant'
import { viaprize } from '@/server/viaprize'
import type { ExtraMetadata } from '@/types/payment'
import { normieTechClient, type paths } from '@viaprize/core/normie-tech'
import { Button } from '@viaprize/ui/button'
import { Card } from '@viaprize/ui/card'

type MetadataType =
    paths['/v1/viaprize/0/checkout']['post']['requestBody']['content']['application/json']['metadata']

async function getTransactionData(transactionId: string) {
    const normieTech = normieTechClient(NORMIE_TECH_URL)
    return await normieTech.GET('/v1/{projectId}/{paymentId}/transactions/{transactionId}', {
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

        cache: "no-store",

    })
}

export const dynamic = 'force-dynamic'
export default async function PaymentResultPage({
    searchParams,
}: {
    searchParams: { transactionId?: string }
}) {
    if (!searchParams.transactionId) {
        notFound()
    }

    const res = await getTransactionData(searchParams.transactionId)

    if (res.error || !res.data) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl">
                    <Card className="overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                        <div className="flex flex-col items-center p-6 text-center">
                            <h1 className="mb-2 text-2xl font-bold text-slate-900">Payment Processing Error</h1>
                            <p className="mb-6 text-slate-600">
                                {res.error ? JSON.stringify(res.error) : 'An unexpected error occurred'}
                            </p>
                            <Link href="/prize" className="w-full">
                                <Button className="w-full">Return to Prizes</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    const { amountInFiat, blockchainTransactionId, metadataJson, extraMetadataJson } = res.data
    console.log(res.data)
    if (!metadataJson || !extraMetadataJson) {
        return <h1>Error: Metadata not defined</h1>
    }

    const metadata = JSON.parse(JSON.stringify(metadataJson)) as MetadataType
    const extraMetadata = JSON.parse(JSON.stringify(extraMetadataJson)) as ExtraMetadata

    if (!extraMetadata.prizeId || !extraMetadata.prizeSlug || !amountInFiat) {
        console.log(extraMetadata, blockchainTransactionId, extraMetadata.prizeSlug, amountInFiat)
        return <h1>Error: Some required data is not defined</h1>
    }

    const donation = await viaprize.donations.getDonationByPaymentId(searchParams.transactionId)

    if (!donation) {
        try {
            await viaprize.prizes.addUsdcFunds({
                donor: extraMetadata.name ?? "Anonymous",

                recipientAddress: metadata.contractAddress,
                isFiat: true,
                prizeId: extraMetadata.prizeId,
                username: extraMetadata.username,
                valueInToken: Number(res.data.amountInToken),
                transactionId: res.data.blockchainTransactionId,
                paymentId: searchParams.transactionId,
            })
        } catch (error) {
            console.error('Error adding USDC funds:', error)
            return (
                <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-2xl">
                        <Card className="overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                            <div className="flex flex-col items-center p-6 text-center">
                                <h1 className="mb-2 text-2xl font-bold text-slate-900">Fund Addition Error</h1>
                                <p className="mb-6 text-slate-600">There was an error adding funds to the prize.</p>
                                <Link href="/prize" className="w-full">
                                    <Button className="w-full">Return to Prizes</Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/prize"
                    className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ALL Prizes
                </Link>

                <Card className="overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg
                                className="h-8 w-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <h1 className="mb-2 text-2xl font-bold text-slate-900">Payment Successful!</h1>
                        <p className="mb-6 text-slate-600">
                            Thank you for supporting this important cause. Your contribution will make a real difference.
                        </p>

                        <div className="mb-6 w-full rounded-lg bg-slate-50 p-4">
                            <div className="text-sm text-slate-600">Transaction Amount</div>
                            <div className="text-2xl font-bold text-slate-900">${amountInFiat.toFixed(2)}</div>
                        </div>

                        <div className="flex w-full flex-col gap-3">
                            <Link href={`/prize/${extraMetadata.prizeSlug}`} className="w-full">
                                <Button className="w-full" variant="outline">
                                    Return to Prize
                                </Button>
                            </Link>

                            {blockchainTransactionId && (<Link
                                href={`https://optimistic.etherscan.io/tx/${blockchainTransactionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full">
                                    View on Optimism
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>)
                            }
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

