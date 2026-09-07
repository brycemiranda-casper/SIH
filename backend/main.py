from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NEXUS-NER API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/incidents", response_model=List[schemas.Incident])
def read_incidents(db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).all()
    
    # Merge live NDMA alerts into the incidents list
    import external_services
    live_geojson = external_services.fetch_ndma_alerts_geojson()
    
    for feat in live_geojson.get("features", []):
        props = feat.get("properties", {})
        coords = feat.get("geometry", {}).get("coordinates", [0, 0])
        live_incident = schemas.Incident(
            id=str(props.get("id", "live-0")),
            type="NDMA Alert",
            severity=props.get("severity", "High").upper(),
            location=f"Lat: {coords[1]:.2f}, Lon: {coords[0]:.2f}",
            status="Active",
            timestamp="Live",
            description=props.get("headline", "Live alert from NDMA CAP feed")
        )
        incidents.append(live_incident)
        
    return incidents

@app.patch("/api/incidents/{incident_id}", response_model=schemas.Incident)
def update_incident(incident_id: str, incident_update: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db_incident.status = incident_update.status
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.get("/api/vehicles", response_model=List[schemas.Vehicle])
def read_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    return vehicles

@app.patch("/api/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(vehicle_id: str, vehicle_update: schemas.VehicleUpdate, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_vehicle.status = vehicle_update.status
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@app.post("/api/ai/risk-prediction", response_model=schemas.RiskPredictionResponse)
def predict_risk(request: schemas.RiskPredictionRequest):
    # Mock AI calculation based on input
    base_risk = 50
    if request.weather_condition == "Heavy Rain":
        base_risk += 20
    if request.terrain_risk == "Mountainous":
        base_risk += 10
    
    base_risk += request.incident_count * 2

    status = "Low"
    if base_risk > 80:
        status = "Critical"
    elif base_risk > 60:
        status = "High"
        
    return {
        "risk_score": min(base_risk, 100),
        "status": status,
        "breakdown": {
            "Terrain": 80 if request.terrain_risk == "Mountainous" else 30,
            "Weather": 90 if request.weather_condition == "Heavy Rain" else 20,
            "Density": min(request.incident_count * 15, 100)
        }
    }

import external_services

@app.get("/api/geojson/weather")
def get_weather_geojson():
    """Fetch live IMD weather data as GeoJSON."""
    return external_services.fetch_imd_weather_geojson()

@app.get("/api/geojson/alerts")
def get_alerts_geojson():
    """Fetch live NDMA CAP alerts as GeoJSON."""
    return external_services.fetch_ndma_alerts_geojson()
