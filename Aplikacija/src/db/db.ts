import {drizzle} from 'drizzle-orm/neon-http'

const url = process.env.DB_URL

if (!url) {
    throw new Error('DB_URL is not defined')
}

const db = drizzle(url, {
    logger: process.env.NODE_ENV === 'development',
})

export { db }


