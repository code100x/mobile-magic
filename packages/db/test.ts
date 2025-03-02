import { config } from 'dotenv'

config({ path: __dirname + '/../../.env' })
console.log('DATABASE_URL:', process.env.DATABASE_URL)