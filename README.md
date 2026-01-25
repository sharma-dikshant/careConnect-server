# Care Connect Server

This is the backend server for the Care Connect application, built with FastAPI and MySQL.

## Project Structure

The project follows a structured modular architecture:

```
careConnect-server/
├── app/
│   ├── api/
│   │   ├── deps.py                 # API dependencies
│   │   └── v1/
│   │       └── endpoints/          # Route handlers
│   │           ├── auth.py
│   │           ├── chats.py
│   │           ├── contexts.py
│   │           ├── patients.py
│   │           └── users.py
│   ├── core/                       # Core application configuration
│   ├── db/
│   │   ├── models.py               # Database models
│   │   └── session.py              # Database session handling
│   ├── schemas/                    # Pydantic models/schemas
│   ├── services/                   # Business logic layer
│   │   ├── auth.py
│   │   ├── chats.py
│   │   ├── contexts.py
│   │   ├── patients.py
│   │   └── users.py
│   ├── main.py                     # Application entry point
│   └── utils.py                    # Utility functions
├── Dockerfile                      # Docker image definition
├── docker-compose.yml              # Docker Compose configuration
├── requirements.txt                # Python dependencies
└── example.env                     # Environment variables template
```

## Setup Guide

### prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- Python 3.11+ (if running locally without Docker)

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp example.env .env
   ```
2. Edit `.env` and provide the necessary variables:
   ```env
   MYSQL_DATABASE=careconnect
   MYSQL_USER=user
   MYSQL_PASSWORD=password
   MYSQL_ROOT_PASSWORD=rootpassword
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### Running with Docker (Recommended)

To start the server and the database:

```bash
docker-compose up --build
```

- The API will be available at: `http://localhost:8000`
- API Documentation (Swagger UI): `http://localhost:8000/docs`
- MySQL Database: `localhost:3306`

To stop the services:
```bash
docker-compose down
```

### Running Locally (Manual Setup)

If you prefer to run the Python server locally:

1. **Set up a Database**:
   Ensure you have a MySQL server running and create a database named `careconnect`. Update your `.env` file's `DB_URL` to point to your local MySQL instance.

2. **Create a Virtual Environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
