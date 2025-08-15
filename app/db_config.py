from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL URL format:
# mysql+pymysql://username:password@host:port/database_name

DB_URL = "mysql+pymysql://root:root@localhost:3306/care_connect"
engine = create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()