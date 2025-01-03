import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type ViaprizeClientDatabase = PostgresJsDatabase<typeof schema>

// export type TableNames =   ExtractTableRelationsFromSchema<keyof schema>;
export class ViaprizeDatabase {
  database: ViaprizeClientDatabase

  constructor({ databaseUrl }: { databaseUrl: string }) {
    this.database = drizzle(
      postgres(
        'postgresql://postgres.gcyuufvbmwfyvguwlxgd:dFvqYlVoyzw6lbaZ@aws-0-us-east-2.pooler.supabase.com:6543/postgres',
      ),
      {
        schema,
      },
    )
  }

  async refreshCache(name: schema.DonationViewNames) {
    await this.database.refreshMaterializedView(schema[name]).concurrently()
  }
}
