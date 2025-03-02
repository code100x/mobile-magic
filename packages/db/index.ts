import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env from package root
config({ path: __dirname + '/../../.env' })  // Adjusted path

const prismaClient = new PrismaClient()
export { prismaClient }