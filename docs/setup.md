# Project Setup

## Prerequisites
- **Node.js** v16+
- **PostgreSQL** (or any supported database)
- **NestJS CLI** (`npm install -g @nestjs/cli`)

## Installation

```sh
git clone <repository-url>
cd backend-project
npm install
```

## Environment Configuration
Create a `.env` file in the root directory and configure your environment variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=supersecretkey
PORT=3000
```

## Running the Project

### Start the development server
```sh
npm run start:dev
```

### Run in production mode
```sh
npm run build
npm run start:prod
```

## Running Tests

```sh
npm run test
```

## Database Migrations

To generate migrations:
```sh
npm run typeorm migration:generate -n MigrationName
```

To run migrations:
```sh
npm run typeorm migration:run
```

To revert migrations:
```sh
npm run typeorm migration:revert
```

