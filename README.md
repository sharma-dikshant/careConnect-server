# CareConnect Server

A robust, scalable backend service for the CareConnect application built with [NestJS](https://nestjs.com/).

## Features

- **Authentication & Authorization**: Secure JWT-based authentication using Passport.
- **User & Patient Management**: Comprehensive APIs for managing users and specific patient records.
- **Appointments System**: Handling and scheduling check-ups and appointments.
- **Care Protocols**: Managing specific care guides and protocols for patients.
- **AI-Integrated Messaging**: Chat and messaging integration, leveraging Google Generative AI (Gemini) and custom RAG servers.
- **File Storage**: AWS S3 integration for robust and scalable file storage.
- **Database**: PostgreSQL with TypeORM for structured, reliable data persistence.
- **API Documentation**: Interactive Swagger API documentation generation.

## Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18 or higher recommended)
- PostgreSQL (or use Docker Compose to run it in a container)
- Docker & Docker Compose (optional, for complete containerized setup)
- AWS Account and Google Gemini API keys (for production/full functionality)

## Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure the variables:

```bash
cp .env.example .env
```

Update `.env` with your your local database credentials, JWT secrets, AWS settings, and API keys.

### 3. Database Setup (Docker)

If you have Docker installed, you can easily spin up the required PostgreSQL database using Docker Compose:

```bash
docker-compose up -d db
```

### 4. Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Documentation

Once the application is running, the Swagger API documentation will be available locally.

For more detailed API and Docker ecosystem instructions, please refer to:
- [API_DOCS.md](./API_DOCS.md) for detailed descriptions of available endpoints.
- [DOCKER.md](./DOCKER.md) for information on running the entire application stack via Docker, including custom Docker images.

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Code Quality

```bash
# Format code using prettier
npm run format

# Run linter
npm run lint
```
