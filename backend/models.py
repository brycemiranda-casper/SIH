from sqlalchemy import Column, Integer, String, Float
from database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    severity = Column(String)
    location = Column(String)
    district = Column(String, nullable=True)
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
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    speed = Column(Integer, default=0)

class District(Base):
    __tablename__ = "districts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    state = Column(String)
    score = Column(Integer)
    risk_level = Column(String)
    active_incidents = Column(Integer, default=0)
    affected_roads = Column(Integer, default=0)

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # Hospital, Relief Camp, PHC, Police Station
    district = Column(String)
    state = Column(String)
    accessibility = Column(String)  # Open, Impaired, Isolated
    lat = Column(Float)
    lon = Column(Float)

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    district = Column(String)
    state = Column(String)
    medicine_stock = Column(Integer, default=100)  # %
    food_stock = Column(Integer, default=100)      # %
    fuel_stock = Column(Integer, default=100)      # %

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String, primary_key=True, index=True)
    commodity = Column(String)  # Medicine, Food, Water, Fuel, Rescue Equipment
    quantity = Column(String)
    origin = Column(String)
    destination = Column(String)
    priority = Column(String)   # CRITICAL, HIGH, NORMAL
    vehicle_id = Column(String, nullable=True)
    status = Column(String)     # Pending, In Transit, Delivered, Delayed
    eta = Column(String)
    created_time = Column(String)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    type = Column(String)      # Landslide, Flood, Road Blocked, Supply Shortage, Weather
    severity = Column(String)  # CRITICAL, HIGH, MEDIUM
    location = Column(String)
    affected_entities = Column(String)
    recommended_action = Column(String)
    timestamp = Column(String)
    confidence = Column(Integer, default=85)
    source = Column(String, default="AI Engine")  # LIVE, SIMULATED, NDMA, IMD

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String)  # Admin, Regional Auth, Fleet Manager, Field Officer, Driver
    name = Column(String)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(String)
    user = Column(String)
    role = Column(String)
    action = Column(String)
    details = Column(String)
