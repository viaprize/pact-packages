import { and, count, eq } from 'drizzle-orm'
import type { z } from 'zod'
import type { ViaprizeDatabase } from '../database'
import {
  donations,
  type insertDonationSchema,
  prizeDonationsView,
} from '../database/schema'

export class Donations {
  db
  constructor(viaprizeDb: ViaprizeDatabase) {
    this.db = viaprizeDb.database
  }
  async getDonationsByPrize() {
    const donations = await this.db.select().from(prizeDonationsView).execute()
    return donations
  }

  async getDonationByTransactionId(transactionId: string) {
    const donation = await this.db.query.donations.findFirst({
      where: eq(donations.transactionId, transactionId),
    })
    return donation
  }

  async addDonation(insertDonation: z.infer<typeof insertDonationSchema>) {
    const donation = await this.db
      .insert(donations)
      .values(insertDonation)
      .execute()

    return donation
  }
  async getFiatDonationsByRecipientAndDonor(
    recipientAddress: string,
    donor: string,
  ) {
    const finalDonations = await this.db.query.donations.findMany({
      where: and(
        eq(donations.recipientAddress, recipientAddress),
        eq(donations.donor, donor),
        eq(donations.isFiat, true),
        eq(donations.isFullyRefunded, false),
        eq(donations.isPartiallyRefunded, false),
      ),
    })

    return finalDonations
  }
  async getDonationByPaymentId(paymentId: string) {
    const donation = await this.db.query.donations.findFirst({
      where: eq(donations.paymentId, paymentId),
    })
    return donation
  }

  async count() {
    const length = (
      await this.db.select({ count: count() }).from(donations).execute()
    )[0]
    return length?.count
  }
}
