from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db_config import Base


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)  # hashed
    phone = Column(String, nullable=False)
    address = Column(String)
    designation = Column(String)
    license = Column(String)
    specialization = Column(String)
    experience = Column(Integer)
    bio = Column(String)
    hospital = Column(String)
    active = Column(Boolean, default=True)
    
    #relationship
    appointments = relationship("Appointment", back_populates="doctor")
    global_contexts = relationship("GlobalContext", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)  # hashed
    active = Column(Boolean, default=True)
    
    #relationship
    appointments = relationship("Appointment", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    active = Column(Boolean, default=True)
    
    #relationship
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    local_contexts = relationship("LocalContext", back_populates="appointment")  # fixed name


class GlobalContext(Base):
    __tablename__ = "global_contexts"
    id = Column(Integer, primary_key=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    file = Column(String)
    active = Column(Boolean, default=True)
    
    #relationship
    doctor = relationship("Doctor", back_populates="global_contexts")


class LocalContext(Base):
    __tablename__ = "local_contexts"
    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    file = Column(String)
    active = Column(Boolean, default=True)
    
    #relationship
    appointment = relationship("Appointment", back_populates="local_contexts")  # fixed name
