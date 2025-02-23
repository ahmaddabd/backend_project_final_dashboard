# Backend Dashboard Project

A modern, secure, and scalable backend dashboard built with NestJS, TypeORM, and PostgreSQL.

## Features

- 🔐 Authentication & Authorization

  - JWT-based authentication
  - Role-based access control
  - Refresh token rotation
  - Password hashing with bcrypt
  - Token blacklisting

- 🏪 Store Management

  - Store creation and management
  - Product catalog
  - Categories
  - Reviews and ratings
  - Progress tracking

- 📊 Admin Dashboard

  - User management
  - Store approvals
  - Analytics and reporting
  - System monitoring

- 🔧 Technical Features
  - TypeScript
  - Clean Architecture
  - CQRS pattern
  - Event-driven architecture
  - Comprehensive logging
  - Error handling
  - Request validation
  - API documentation with Swagger
  - Unit and integration tests
  - Database migrations
  - Environment-based configuration

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v13 or later)
- Redis (optional, for caching)
- Docker (optional, for containerization)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/backend-dashboard.git
   cd backend-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.development.example .env.development
   # Edit .env.development with your configuration
   ```

4. Start PostgreSQL:

   ```bash
   # If using Docker:
   docker-compose up -d postgres
   # Or use your local PostgreSQL installation
   ```

5. Run database migrations:

   ```bash
   npm run migration:run
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at http://localhost:3000/api
Swagger documentation will be at http://localhost:3000/api/docs

## Project Structure

```
src/
├── application/          # Application layer (use cases, DTOs)
│   ├── auth/            # Authentication & authorization
│   ├── products/        # Product management
│   ├── stores/          # Store management
│   └── reviews/         # Reviews & ratings
├── domain/              # Domain layer (entities, interfaces)
│   ├── entities/        # Domain entities
│   ├── interfaces/      # Domain interfaces
│   └── repositories/    # Repository interfaces
├── infrastructure/      # Infrastructure layer
│   ├── database/        # Database configuration
│   ├── repositories/    # Repository implementations
│   └── services/        # External services
├── interface/           # Interface layer (controllers)
│   └── http/           # HTTP controllers
└── utils/              # Utility functions and helpers
```

## Available Scripts

- `npm run start:dev` - Start the development server
- `npm run build` - Build the application
- `npm run start:prod` - Start the production server
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase
- `npm run migration:generate` - Generate database migrations
- `npm run migration:run` - Run database migrations
- `npm run migration:revert` - Revert the last migration

## API Documentation

The API documentation is available through Swagger UI when running in development mode. Visit `/api/docs` to view the interactive documentation.

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Set up production environment:

   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production configuration
   ```

3. Start the production server:
   ```bash
   npm run start:prod
   ```

For Docker deployment:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
