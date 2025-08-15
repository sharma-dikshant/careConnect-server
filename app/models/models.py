from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db_config import Base



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False) # hashed
    
    
    
class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True)
    patient = Column(Integer)
    doctor = Column(Integer)
    active = Column(Boolean, default=True)
    
    
    
class Context(Base):
    __tablename__ = "contexts"
    id = Column(Integer, primary_key=True)
    assignment = Column(Integer)
    file = Column(String)
    active = Column(Boolean, default=True)