import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type ViaprizeClientDatabase = PostgresJsDatabase<typeof schema>

// export type TableNames =   ExtractTableRelationsFromSchema<keyof schema>;
export class ViaprizeDatabase {
  database: ViaprizeClientDatabase

  constructor({ databaseUrl }: { databaseUrl: string }) {
    this.database = drizzle(postgres(databaseUrl), {
      schema,
    })
  }

  async refreshCache(name: schema.DonationViewNames) {
    await this.database.refreshMaterializedView(schema[name]).concurrently()
  }
}
