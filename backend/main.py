from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import random

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RightRoute API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── INCIDENTS ENDPOINTS ────────────────────────────────────────────────────────
@app.get("/api/incidents", response_model=List[schemas.Incident])
def read_incidents(db: Session = Depends(get_db)):
    db_incidents = db.query(models.Incident).all()
    result = [schemas.Incident.model_validate(inc) for inc in db_incidents]
    
    # Merge live NDMA alerts into the incidents list
    import external_services
    live_geojson = external_services.fetch_ndma_alerts_geojson()
    
    for feat in live_geojson.get("features", []):
        props = feat.get("properties", {})
        coords = feat.get("geometry", {}).get("coordinates", [0, 0])
        live_incident = schemas.Incident(
            id=str(props.get("id", "live-0")),
            type="NDMA Alert",
            severity=props.get("severity", "High").capitalize(),
            location=f"Lat: {coords[1]:.2f}, Lon: {coords[0]:.2f}",
            district="NER Region",
            status="Active",
            timestamp="Live Feed",
            description=props.get("headline", "Live alert from NDMA CAP feed")
        )
        result.append(live_incident)

    # Merge live Open-Meteo weather alerts into the incidents list
    weather_geojson = external_services.fetch_imd_weather_geojson()
    for feat in weather_geojson.get("features", []):
        props = feat.get("properties", {})
        coords = feat.get("geometry", {}).get("coordinates", [[[0, 0]]])[0][0]
        weather_incident = schemas.Incident(
            id=str(props.get("id", "weather-0")),
            type=props.get("type", "Weather Alert"),
            severity=props.get("severity", "High").capitalize(),
            location=props.get("label", f"Lat: {coords[1]:.2f}, Lon: {coords[0]:.2f}"),
            district="Open-Meteo Live",
            status="Active",
            timestamp="Live Stream",
            description=f"Live Weather Monitoring: {props.get('type', 'Rain Alert')} ({props.get('rainfall_mm', 0)} mm precipitation detected)"
        )
        result.append(weather_incident)
        
    return result


@app.post("/api/incidents", response_model=schemas.Incident)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    db_incident = models.Incident(**incident.dict())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.patch("/api/incidents/{incident_id}", response_model=schemas.Incident)
def update_incident(incident_id: str, incident_update: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db_incident.status = incident_update.status
    db.commit()
    db.refresh(db_incident)
    return db_incident


# ── VEHICLES ENDPOINTS ────────────────────────────────────────────────────────
@app.get("/api/vehicles", response_model=List[schemas.Vehicle])
def read_vehicles(db: Session = Depends(get_db)):
    return db.query(models.Vehicle).all()

@app.patch("/api/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(vehicle_id: str, vehicle_update: schemas.VehicleUpdate, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if vehicle_update.status is not None:
        db_vehicle.status = vehicle_update.status
    if vehicle_update.eta is not None:
        db_vehicle.eta = vehicle_update.eta
    if vehicle_update.location is not None:
        db_vehicle.location = vehicle_update.location
    if vehicle_update.lat is not None:
        db_vehicle.lat = vehicle_update.lat
    if vehicle_update.lon is not None:
        db_vehicle.lon = vehicle_update.lon
    if vehicle_update.speed is not None:
        db_vehicle.speed = vehicle_update.speed
        
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


# ── DISTRICT ACCESSIBILITY ENDPOINTS ──────────────────────────────────────────
@app.get("/api/districts", response_model=List[schemas.District])
def get_districts(db: Session = Depends(get_db)):
    return db.query(models.District).all()


# ── CRITICAL FACILITIES ENDPOINTS ─────────────────────────────────────────────
@app.get("/api/facilities", response_model=List[schemas.Facility])
def get_facilities(db: Session = Depends(get_db)):
    return db.query(models.Facility).all()


# ── WAREHOUSES & INVENTORY ENDPOINTS ──────────────────────────────────────────
@app.get("/api/warehouses", response_model=List[schemas.Warehouse])
def get_warehouses(db: Session = Depends(get_db)):
    return db.query(models.Warehouse).all()


# ── ESSENTIAL LOGISTICS & DELIVERIES ENDPOINTS ────────────────────────────────
@app.get("/api/deliveries", response_model=List[schemas.Delivery])
def get_deliveries(db: Session = Depends(get_db)):
    return db.query(models.Delivery).all()

@app.post("/api/deliveries", response_model=schemas.Delivery)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = models.Delivery(**delivery.dict())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@app.patch("/api/deliveries/{delivery_id}", response_model=schemas.Delivery)
def update_delivery(delivery_id: str, delivery_update: schemas.DeliveryUpdate, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    if delivery_update.status is not None:
        db_delivery.status = delivery_update.status
    if delivery_update.vehicle_id is not None:
        db_delivery.vehicle_id = delivery_update.vehicle_id
    if delivery_update.eta is not None:
        db_delivery.eta = delivery_update.eta
        
    db.commit()
    db.refresh(db_delivery)
    return db_delivery


# ── ALERTS & NOTIFICATIONS ENDPOINTS ─────────────────────────────────────────
@app.get("/api/alerts", response_model=List[schemas.Alert])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).all()


# ── WHAT-IF SIMULATION ENDPOINT ───────────────────────────────────────────────
@app.post("/api/simulation/road-block")
def simulate_road_block(road_name: str, db: Session = Depends(get_db)):
    affected_vehicles = db.query(models.Vehicle).filter(models.Vehicle.location.contains(road_name)).all()
    affected_deliveries = db.query(models.Delivery).filter(models.Delivery.status == 'In Transit').all()
    
    return {
        "road": road_name,
        "status": "SIMULATED BLOCKAGE",
        "affected_vehicles_count": len(affected_vehicles),
        "affected_vehicles": [v.id for v in affected_vehicles],
        "affected_deliveries_count": len(affected_deliveries),
        "estimated_delay_minutes": 120,
        "recommended_action": "Reroute via nearest regional bypass highway."
    }


# ── AI RISK & EXPLAINABILITY ENDPOINT ─────────────────────────────────────────
@app.post("/api/ai/risk-prediction", response_model=schemas.RiskPredictionResponse)
def predict_risk(request: schemas.RiskPredictionRequest):
    base_risk = 30
    explanation = []
    
    if request.weather_condition == "Heavy Rain":
        base_risk += 25
        explanation.append("Heavy Rainfall detected (+25% risk)")
    elif request.weather_condition == "Thunderstorm":
        base_risk += 35
        explanation.append("Severe Thunderstorm warning active (+35% risk)")
        
    if request.terrain_risk == "Mountainous":
        base_risk += 20
        explanation.append("High-altitude Mountainous Terrain (+20% slope hazard)")
        
    if request.road_condition == "Slippery" or request.road_condition == "Damaged":
        base_risk += 15
        explanation.append("Road surface compromise / landslide prone (+15% risk)")
        
    incident_addition = min(request.incident_count * 10, 30)
    base_risk += incident_addition
    if request.incident_count > 0:
        explanation.append(f"{request.incident_count} Active Road Blockage Incidents (+{incident_addition}% risk)")

    final_score = min(base_risk, 100)
    status = "Low"
    if final_score > 80:
        status = "Critical"
    elif final_score > 60:
        status = "High"
    elif final_score > 40:
        status = "Medium"
        
    return {
        "risk_score": final_score,
        "status": status,
        "breakdown": {
            "Terrain": 85 if request.terrain_risk == "Mountainous" else 30,
            "Weather": 90 if "Rain" in request.weather_condition or "Thunderstorm" in request.weather_condition else 25,
            "Density": min(request.incident_count * 20, 100)
        },
        "explanation": explanation
    }


# ── SITUATION REPORTS & EXPORT ────────────────────────────────────────────────
@app.get("/api/reports/situation")
def get_situation_report(db: Session = Depends(get_db)):
    active_incidents = db.query(models.Incident).filter(models.Incident.status == 'Active').count()
    transit_vehicles = db.query(models.Vehicle).filter(models.Vehicle.status == 'In Transit').count()
    critical_deliveries = db.query(models.Delivery).filter(models.Delivery.priority == 'CRITICAL').count()
    districts_high_risk = db.query(models.District).filter(models.District.risk_level.in_(['HIGH', 'CRITICAL'])).count()
    
    return {
        "report_title": "RightRoute Daily Situation & Accessibility Summary",
        "generated_at": "Live Stream",
        "ner_accessibility_score": 78,
        "active_incidents": active_incidents,
        "vehicles_in_transit": transit_vehicles,
        "critical_deliveries_pending": critical_deliveries,
        "high_risk_districts": districts_high_risk,
        "summary": f"Currently {active_incidents} active road blockages affecting {districts_high_risk} districts. {transit_vehicles} vehicles are actively transporting essential commodities across the North Eastern Region."
    }


# ── AUTH & AUDIT LOGS ENDPOINTS ────────────────────────────────────────────────
@app.get("/api/auth/users", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/api/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).all()


# ── LIVE GEOJSON EXTERNAL FEEDS ───────────────────────────────────────────────
import external_services

@app.get("/api/geojson/weather")
def get_weather_geojson():
    return external_services.fetch_imd_weather_geojson()

@app.get("/api/geojson/alerts")
def get_alerts_geojson():
    return external_services.fetch_ndma_alerts_geojson()
