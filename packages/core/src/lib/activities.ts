import type { ViaprizeDatabase } from '../database'
import { activities } from '../database/schema'
export class Activities {
  db
  constructor(viaprizeDb: ViaprizeDatabase) {
    this.db = viaprizeDb.database
  }
  createActivity(data: typeof activities.$inferInsert) {
    return this.db.insert(activities).values(data)
  }
}
