from sqlalchemy import Column, Integer, String, Float
from database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    severity = Column(String)
    location = Column(String)
    status = Column(String)
    timestamp = Column(String)
    description = Column(String)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)
    driver = Column(String)
    type = Column(String)
    cargo = Column(String)
    location = Column(String)
    status = Column(String)
    eta = Column(String)
    risk = Column(String)
    lastUpdate = Column(String)
