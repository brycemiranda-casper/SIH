from pydantic import BaseModel
from typing import Optional, Dict

class IncidentBase(BaseModel):
    id: str
    type: str
    severity: str
    location: str
    status: str
    timestamp: str
    description: str

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

class VehicleUpdate(BaseModel):
    status: str

class Vehicle(VehicleBase):
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
