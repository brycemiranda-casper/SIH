from pydantic import BaseModel
from typing import Optional, Dict, List

class IncidentBase(BaseModel):
    id: str
    type: str
    severity: str
    location: str
    district: Optional[str] = None
    status: str
    timestamp: str
    description: str

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: str

class Incident(IncidentBase):
    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    id: str
    driver: str
    type: str
    cargo: str
    location: str
    status: str
    eta: str
    risk: str
    lastUpdate: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    speed: Optional[int] = 0

class VehicleUpdate(BaseModel):
    status: Optional[str] = None
    eta: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    speed: Optional[int] = None

class Vehicle(VehicleBase):
    class Config:
        from_attributes = True

class DistrictBase(BaseModel):
    id: str
    name: str
    state: str
    score: int
    risk_level: str
    active_incidents: int = 0
    affected_roads: int = 0

class District(DistrictBase):
    class Config:
        from_attributes = True

class FacilityBase(BaseModel):
    id: str
    name: str
    type: str
    district: str
    state: str
    accessibility: str
    lat: float
    lon: float

class Facility(FacilityBase):
    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    id: str
    name: str
    location: str
    district: str
    state: str
    medicine_stock: int = 100
    food_stock: int = 100
    fuel_stock: int = 100

class Warehouse(WarehouseBase):
    class Config:
        from_attributes = True

class DeliveryBase(BaseModel):
    id: str
    commodity: str
    quantity: str
    origin: str
    destination: str
    priority: str
    vehicle_id: Optional[str] = None
    status: str
    eta: str
    created_time: str

class DeliveryCreate(DeliveryBase):
    pass

class DeliveryUpdate(BaseModel):
    status: Optional[str] = None
    vehicle_id: Optional[str] = None
    eta: Optional[str] = None

class Delivery(DeliveryBase):
    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    id: str
    title: str
    type: str
    severity: str
    location: str
    affected_entities: str
    recommended_action: str
    timestamp: str
    confidence: int = 85
    source: str = "AI Engine"

class Alert(AlertBase):
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    id: str
    username: str
    role: str
    name: str

class User(UserBase):
    class Config:
        from_attributes = True

class AuditLogBase(BaseModel):
    timestamp: str
    user: str
    role: str
    action: str
    details: str

class AuditLog(AuditLogBase):
    id: int
    class Config:
        from_attributes = True

class RiskPredictionRequest(BaseModel):
    weather_condition: str
    road_condition: str
    terrain_risk: str
    incident_count: int

class RiskPredictionResponse(BaseModel):
    risk_score: int
    status: str
    breakdown: Dict[str, int]
    explanation: List[str]
