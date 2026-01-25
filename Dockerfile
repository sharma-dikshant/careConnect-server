FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for mysqlclient/pymysql sometimes, though pymysql is pure python)
# But pkg-config or gcc might be needed for other things. 
# For now, slim is often enough for pymysql.
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
