import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../db/db'

async function testConnection() {
    const result = await db.execute(sql`select 1 as ok`)
    console.log('DB connection OK:', result)
}

testConnection().catch((error) => {
    console.error('DB connection FAILED:')
    console.error(error)
    process.exit(1)
})
