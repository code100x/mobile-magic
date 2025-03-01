# Project Setup Guide

## Prerequisites
- Docker & Docker Compose
- Bun runtime (v1.0.0+)
- Node.js (v18+)
- Redis CLI (optional)

## Installation
```bash
# Install dependencies
bun install
```

## Database Setup
```bash
# Start PostgreSQL container
docker run --name postgres-container \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  -d postgres

# Configure database
echo "DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase" > packages/db/.env

# Run migrations
cd packages/db && bunx prisma migrate dev && bunx prisma generate
```

## Redis Setup
```bash
# Start Redis container
docker run --name my-redis -d -p 6379:6379 redis

# Configure Redis
echo 'REDIS_URL="redis://localhost:6379"' > packages/redis/.env
```

## Code Server Setup
```bash
# Build and run code-server
cd apps/code-server
docker build -t code-server .
docker run -d -p 8080:8080 -p 8081:8081 -v /tmp/bolty-worker:/tmp/bolty-worker code-server
```

## Environment Configuration
```bash
# Copy example environment files
cp packages/db/.env.example packages/db/.env
cp packages/redis/.env.example packages/redis/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/frontend/.env.example apps/frontend/.env
cp apps/primary-backend/.env.example apps/primary-backend/.env

# Edit .env files with actual credentials
# (Update API keys and secrets as needed)
```

## Starting the Application
```bash
# Run development servers
bun run dev
```

## Important Notes
- Replace placeholder values in .env files with actual credentials
- Ensure Docker containers are running before starting the app
- API keys for LLM providers (OpenAI/Anthropic) must be added to apps/worker/.env
- Access code-server at http://localhost:8080



## Things to do
 - Complete the orchestrator. Its an empty folder right now. It should talk to ASGs and scale them up/drain them when a worker becomes idle
 - Send the user response back to the LLM. If a user is changing a file, the LLM needs to be aware of this. 
 - UI cleanups
 - Figure out why npm install doesnt work from time to time. Most probably we need to run them sequentially so create some sort of async queue to do it.
- Create a load balancer service that routes requests from id.worker.100xdevs.com to the respective worker for that project
- Add multiplayer mode