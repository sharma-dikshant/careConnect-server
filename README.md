# CareConnect Server

NestJS backend for CareConnect. It is the single API surface consumed by the
frontend: authentication, user and patient records, appointments, messaging,
care protocols, wearable-device data, and file uploads. It also orchestrates
the RAG microservice and AWS S3 on behalf of clients.

See the top-level [`DEVELOPER_GUIDE.md`](../DEVELOPER_GUIDE.md) for how this
service fits into the broader stack.

---

## Features

- **Auth** — JWT (Passport) with role-aware signup flows for doctors and patients; OTP helpers for verification.
- **User / patient management** — CRUD, search, and profile endpoints.
- **Appointments** — scheduling, status transitions, and query helpers used by both portals.
- **Care protocols** — doctor-authored protocols, linkable to appointments.
- **Messaging** — in-appointment chat. Patient messages trigger a call to the RAG server and persist the AI reply as a `BOT` message.
- **Devices** — endpoints for syncing wearable-device metrics.
- **File storage** — S3 uploads with presigned-URL issuance for the frontend and the RAG ingest pipeline.
- **Email** — transactional email via Nodemailer (OTP, notifications).
- **API docs** — Swagger UI at `/api-docs`.

---

## Tech stack

- **Runtime**: Node.js 18+, TypeScript 5.7
- **Framework**: [NestJS 11](https://nestjs.com/)
- **Database**: PostgreSQL 15 + [TypeORM 0.3](https://typeorm.io/)
- **Auth**: `@nestjs/jwt`, Passport
- **AWS**: `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`
- **Validation**: `class-validator`, `class-transformer`
- **Email**: Nodemailer
- **Testing**: Jest + Supertest

---

## Project structure

```
careConnect-server/
├── src/
│   ├── main.ts                    # Nest bootstrap, CORS, Swagger, validation
│   ├── app.module.ts              # Root module wiring
│   ├── auth/                      # Login, signup, JWT, guards, decorators
│   ├── users/                     # Generic user endpoints
│   ├── patients/                  # Patient-specific endpoints
│   ├── appointments/              # Scheduling
│   ├── messages/                  # Chat + RAG integration
│   ├── care_protocols/            # Protocol CRUD
│   ├── devices/                   # Wearable-device sync
│   ├── otp/                       # OTP generation & verification
│   ├── entities/                  # TypeORM entities (User, Doctor, Patient, ...)
│   ├── database/                  # TypeORM module + provider
│   ├── dto/                       # Shared DTOs (auth, pagination, api response)
│   ├── pipes/                     # e.g. TrimPipe
│   ├── templates/                 # HTML email templates
│   ├── utils/                     # S3 service, email util, password util
│   └── constants/                 # App-wide constants
├── test/                          # Jest e2e specs
├── docker-compose.yml             # Local dev stack (Postgres + backend)
├── docker-compose.full.yml        # Full stack incl. frontend + RAG
├── Dockerfile
├── API_DOCS.md
├── DOCKER.md
├── example.env
└── package.json
```

Entry point: `src/main.ts`. It configures global validation pipes, the
`ApiResponseDto` wrapper, CORS, and mounts Swagger at `/api-docs` before
listening on `PORT` (default `3000`).

---

## Prerequisites

- Node.js 18+
- Docker + Docker Compose (recommended)
- PostgreSQL 15 (only if running without Docker)
- AWS credentials with S3 access (uploads)
- Google Gemini API key (consumed by the RAG server)
- A Gmail app password (optional, for OTP and email)

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp example.env .env
```

Fill in at least `DB_*`, `JWT_SECRET`, `AWS_*`, and `BOT_SERVER_BASE_URL`.
See [Environment](#environment) below for the full list.

### 3. Pick a run mode

**A. Full stack via Docker (recommended for end-to-end work):**

```bash
docker compose up --build
```

This brings up:

| Service      | Port  | Description                  |
|--------------|-------|------------------------------|
| `postgres`   | 5434  | App database                 |
| `rag-db`     | 5436  | pgvector database (RAG)      |
| `backend`    | 3000  | This service (watch mode)    |
| `ai-server`  | 8080  | RAG server (FastAPI)         |
| `frontend`   | 5173  | Vite dev server              |

**B. Backend only, host Node.js:**

```bash
docker compose up -d postgres   # just the DB
npm run start:dev               # watch mode on :3000
```

### 4. Verify

- Swagger: `http://localhost:3000/api-docs`
- Health: `GET http://localhost:3000/health` (if enabled)

See [`DOCKER.md`](./DOCKER.md) for the Docker-specific details and
[`API_DOCS.md`](./API_DOCS.md) for endpoint reference.

---

## Environment

| Variable                | Purpose                                            |
|-------------------------|----------------------------------------------------|
| `DB_HOST`               | Postgres host (`postgres` in Compose, else `localhost`) |
| `DB_PORT`               | Postgres port (`5435` in Compose mapping, `5432` inside) |
| `DB_USERNAME`           | Postgres user                                      |
| `DB_PASSWORD`           | Postgres password                                  |
| `DB_NAME`               | Database name (`care_connect`)                     |
| `JWT_SECRET`            | HS256 signing secret                               |
| `JWT_EXPIRES_IN`        | Access-token TTL (e.g. `30m`)                      |
| `PORT`                  | HTTP port (default `3000`)                         |
| `AWS_REGION`            | Region for S3 client                               |
| `AWS_ACCESS_KEY_ID`     | S3 credentials                                     |
| `AWS_SECRET_ACCESS_KEY` | S3 credentials                                     |
| `AWS_S3_BUCKET_NAME`    | Bucket used for uploads                            |
| `BOT_SERVER_BASE_URL`   | RAG server base URL                                |
| `GEMINI_API_KEY`        | Reserved / optional direct use                     |
| `SMTP_USER`             | Gmail username for Nodemailer                      |
| `SMTP_PASS`             | Gmail app password                                 |

---

## Scripts

| Command                | What it does                            |
|------------------------|-----------------------------------------|
| `npm run start`        | Run compiled build                      |
| `npm run start:dev`    | Nest in watch mode (ts-node-dev)        |
| `npm run start:prod`   | Run `dist/main.js` with production env  |
| `npm run build`        | Compile TypeScript to `dist/`           |
| `npm run test`         | Jest unit tests                         |
| `npm run test:e2e`     | Jest end-to-end tests                   |
| `npm run test:cov`     | Coverage report                         |
| `npm run lint`         | ESLint (autofix)                        |
| `npm run format`       | Prettier                                |

---

## Module map

| Module           | Primary routes                              | Notes |
|------------------|---------------------------------------------|-------|
| `auth`           | `POST /auth/login`, `POST /auth/signup/*`   | Issues JWT; `@CurrentUser()` decorator surfaces the authenticated user. |
| `users`          | `GET /users`, `PUT /users/:id`              | Shared user CRUD.                                                       |
| `patients`       | `GET /patients/...`                         | Patient-specific records and lookups.                                    |
| `appointments`   | `GET /appointments`, `POST /appointments`   | Scheduling and state.                                                    |
| `messages`       | `GET /messages/:appointmentId`, `POST /messages` | On send, calls the RAG server `/query` and stores the bot reply.  |
| `care_protocols` | CRUD under `/care-protocols`                | Doctor-authored.                                                         |
| `devices`        | `POST /devices/sync`, etc.                  | Wearable metrics.                                                        |
| `otp`            | `POST /otp/send`, `POST /otp/verify`        | Email-delivered codes.                                                   |

Common DTO wrappers (`ApiResponseDto`, `PaginationDto`) live in `src/dto/` and
are consumed across controllers.

---

## Testing

```bash
npm run test           # unit
npm run test:e2e       # end-to-end (Supertest)
npm run test:cov       # coverage
```

Tests run against an in-memory config by default. For e2e, point a disposable
Postgres at `.env.test` or bring up the Compose database.

---

## Code quality

```bash
npm run lint
npm run format
```

Lint and format are expected to pass before review.

---

## Deployment

Production deployment happens via the CDK stack in
[`../careConnect-infra`](../careConnect-infra/README.md), which provisions an
EC2 instance for this service, an RDS Postgres, and an S3 bucket. Rolling out
new code today is manual (SSM into the instance, pull, restart).

---

## Further reading

- [`API_DOCS.md`](./API_DOCS.md) — detailed endpoint reference
- [`DOCKER.md`](./DOCKER.md) — Docker / Compose specifics
- [`../DEVELOPER_GUIDE.md`](../DEVELOPER_GUIDE.md) — cross-service architecture
