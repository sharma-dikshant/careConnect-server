# Docker Setup for CareConnect Server

## Quick Start

### Development Mode

1. **Make sure your `.env` file has the required credentials:**
   ```bash
   # The .env file should contain:
   # - GOOGLE_API_KEY
   # - AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME
   ```

2. **Start all services:**
   ```bash
   docker-compose up
   ```

3. **Start with rebuild (if you changed dependencies):**
   ```bash
   docker-compose up --build
   ```

4. **Run in detached mode (background):**
   ```bash
   docker-compose up -d
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

6. **Stop all services:**
   ```bash
   docker-compose down
   ```

### With pgAdmin (Database Management Tool)

To start with pgAdmin for database management:

```bash
docker-compose --profile tools up
```

Access pgAdmin at: http://localhost:5050
- Email: admin@careconnect.com
- Password: admin

To connect to PostgreSQL in pgAdmin:
- Host: postgres
- Port: 5432
- Database: care_connect
- Username: postgres
- Password: postgres

## Services

### PostgreSQL Database
- **Port:** 5432
- **Database:** care_connect
- **Username:** postgres
- **Password:** postgres
- **Data persistence:** postgres_data volume

### NestJS Application
- **Port:** 3000
- **Hot reload:** Enabled in development mode
- **API:** http://localhost:3000

### pgAdmin (Optional)
- **Port:** 5050
- **Web UI:** http://localhost:5050

## Production Mode

To run in production mode:

1. **Build production image:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Useful Commands

### Database

**Access PostgreSQL CLI:**
```bash
docker-compose exec postgres psql -U postgres -d care_connect
```

**Backup database:**
```bash
docker-compose exec postgres pg_dump -U postgres care_connect > backup.sql
```

**Restore database:**
```bash
docker-compose exec -T postgres psql -U postgres care_connect < backup.sql
```

### Application

**Access app container shell:**
```bash
docker-compose exec app sh
```

**Install new dependencies:**
```bash
docker-compose exec app npm install <package-name>
# Then rebuild: docker-compose up --build
```

**Run migrations (if you have any):**
```bash
docker-compose exec app npm run migration:run
```

### Cleanup

**Remove all containers and volumes:**
```bash
docker-compose down -v
```

**Remove all images:**
```bash
docker-compose down --rmi all
```

## Troubleshooting

### Port already in use
If port 3000 or 5432 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port to 3001
```

### Database connection issues
Make sure the database is healthy before the app starts. The `depends_on` with `condition: service_healthy` ensures this.

### Hot reload not working
Make sure the volume mounts are correct in `docker-compose.yml`. The source code should be mounted to `/app/src`.

### Environment variables not loading
Make sure your `.env` file is in the same directory as `docker-compose.yml` and contains all required variables.

## Environment Variables

See `.env.example` for all required environment variables. Copy it to `.env` and fill in your actual values:

```bash
cp .env.example .env
# Then edit .env with your actual credentials
```

## Network

All services are connected via the `careconnect-network` bridge network, allowing them to communicate using service names (e.g., `postgres`, `app`).
