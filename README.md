# Mobile Magic

A LLM based web application that allows users to create the React Native app they want in Web Browser.

## Project Structure

```
mobile-magic/
├── apps/
│   ├── frontend/         # Next.js frontend application
│   ├── primary-backend/  # Primary backend service
│   └── worker/          # Worker service
├── packages/
│   ├── common/          # Shared utilities and components
│   ├── db/             # Database related code with Prisma
│   ├── eslint-config/  # Shared ESLint configurations
│   └── redis/          # Redis related functionality
```

## Tech Stack
- Bun 1.2.2+
- TypeScript
- Next.js
- Express
- Prisma
- Redis
- Turborepo

## Requirements
- Node.js >= 18
- Bun 1.2.2 or higher


## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Setup environment 
- copy all the `.env.example` into `.env`
   ```bash
   cp packages/db/.env.example packages/db/.env
   cp packages/redis/.env.example packages/redis/.env
   cp apps/worker/.env.example apps/worker/.env
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/primary-backend/.env.example apps/primary-backend/.env
   ```
- setup postgresql database using docker
   ```bash
   docker run -d -e POSTGRES_PASSWORD=mypassword -p 5432:5432 postgres
   ```
- postgres database url in `packages/db`: 
   ```
   postgresql://postgres:mypassword@localhost:5432/postgres
   ```
- create prisma client and deploy migrations from `/packages/db`
   ```bash
   bunx prisma generate
   bunx prisma migrate dev
   ```

- build the `code-server` image
  ```bash
  cd apps/code-server
  docker build -t code-server-update .
  ```

- create a bolty-worker named expo(React Native) app in `/tmp`
  ```bash
  npx create-expo-app@latest bolty-worker
  ```

- run the `code-server` image
  ```bash
  docker run -d -p 8080:8080 -p 8081:8081 -v /tmp/bolty-worker:/tmp/bolty-worker code-server-update
  ```


1. setup redis using docker
   ```bash
   docker run -d -p 6379:6379 redis
   ```

2. run the project
   ```bash
   bun run dev
   ```

## Available Scripts
- `bun run build` - Build all packages and apps
- `bun run dev` - Start development environment
- `bun run lint` - Run linting
- `bun run format` - Format code with Prettier
- `bun run check-types` - Run TypeScript type checking

## Things to do
 - Complete the orchestrator. Its an empty folder right now. It should talk to ASGs and scale them up/drain them when a worker becomes idle
 - Send the user response back to the LLM. If a user is changing a file, the LLM needs to be aware of this. 
 - UI cleanups
 - Figure out why npm install doesnt work from time to time. Most probably we need to run them sequentially so create some sort of async queue to do it.
- Create a load balancer service that routes requests from id.worker.100xdevs.com to the respective worker for that project
- Add multiplayer mode