import { env } from "@/env";
import { viaprize } from "@/server/viaprize";
import { normieTechClient, type paths } from "@viaprize/core/normie-tech"
import { type NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic'
type MetadataType = paths['/v1/viaprize/0/checkout']['post']['requestBody']['content']['application/json']['metadata']
type ExtraMetadata = {
    prizeId: string
    username: string
}
// components['']
// contractAddress: input.spender,
// userAddress: user.wallet.address,
// deadline: input.deadline,
// signature: signature,
//                 tokenAddress: constants.USDC,
//                     amountApproved: input.amount,
//                         ethSignedMessage: hash,
export async function GET(request: NextRequest) {

    const transactionId = request.nextUrl.searchParams.get('transactionId')
    if (!transactionId) {
        return {
            status: 404,
            body: 'Not Found'
        }
    }
    const paymentDetails = await normieTechClient.GET('/v1/{projectId}/{paymentId}/transactions/{transactionId}', {
        params: {
            header: {
                "x-api-key": env.NORMIE_TECH_API_KEY
            },
            path: {
                paymentId: 0,
                projectId: "viaprize",
                transactionId
            }
        }
    })

    const donation = await viaprize.donations.getDonationByPaymentId(transactionId)
    if (paymentDetails.error || !paymentDetails.data) {
        return {
            status: 500,
            body: JSON.stringify(paymentDetails.error)
        }
    }
    if (!donation && paymentDetails.data.metadata && paymentDetails.data.extraMetadataJson) {

        const metadata = JSON.parse(JSON.stringify(paymentDetails.data.metadata)) as MetadataType
        const extraMetadata = JSON.parse(JSON.stringify(paymentDetails.data.extraMetadataJson)) as ExtraMetadata
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
    }
    return NextResponse.redirect(`/checkout/success?transactionId=${transactionId}`)
}