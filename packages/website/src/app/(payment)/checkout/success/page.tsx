import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { env } from '@/env'
import { NORMIE_TECH_API_KEY, NORMIE_TECH_URL } from '@/lib/constant'
import { normieTechClient } from '@viaprize/core/normie-tech'
import { Button } from '@viaprize/ui/button'
import { Card } from '@viaprize/ui/card'


async function getTransactionData(transactionId: string) {
    const normieTech = normieTechClient(NORMIE_TECH_URL)
    const transactionData = (await normieTech.GET('/v1/{projectId}/transactions/{transactionId}', {
        params: {
            header: {
                "x-api-key": NORMIE_TECH_API_KEY ?? "",

            },
            path: {
                projectId: "viaprize",
                transactionId: transactionId
            }

        }
    }))
    return transactionData
}



export default async function PaymentSuccessPage({
    searchParams
}: {
    searchParams: { transactionId?: string }
}) {
    if (!searchParams.transactionId) {
        notFound()
    }
    const res = await getTransactionData(searchParams.transactionId)



    if (res.error) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl">
                    <Card className="overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                        <div className="flex flex-col items-center p-6 text-center">
                            <h1 className="mb-2 text-2xl font-bold text-slate-900">Payment Processing Error</h1>
                            <p className="mb-6 text-slate-600">{JSON.stringify(res.error)}</p>
                            <Link href="/reports" className="w-full">
                                <Button className="w-full">Return to Reports</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }
    if (!res.data) {
        return "Error"
    }
    const { amountInFiat, blockchainTransactionId, extraMetadataJson } = res.data
    const extraMetadata = JSON.parse(JSON.stringify(extraMetadataJson))

    if (!extraMetadata || !extraMetadata.sender || !blockchainTransactionId || !extraMetadata.hypercertId || !amountInFiat) {
        return (
            <h1>Error some data not defined</h1>
        )
    }





    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/reports"
                    className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ALL REPORTS
                </Link>

                <Card className="overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
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
                            <Link href={`${extraMetadata.redirectUrl}`} className="w-full">
                                <Button className="w-full" variant="outline">
                                    Return to Report
                                </Button>
                            </Link>

                            <Link
                                href={`https://optimistic.etherscan.io/tx/${blockchainTransactionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full">
                                    View on Optimism
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}