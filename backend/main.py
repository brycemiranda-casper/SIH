from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="NEXUS-NER AI Backend", version="1.0.0")

class RiskPredictionRequest(BaseModel):
    weather_condition: str
    road_condition: str
    terrain_risk: str
    incident_count: int

@app.get("/")
def read_root():
    return {"message": "Welcome to NEXUS-NER AI API"}

@app.get("/api/vehicles")
def get_vehicles():
    # Dummy vehicles
    return [
        {"id": "MED-101", "cargo": "Medicine", "location": "Bomdila", "status": "Moving", "risk": "High"},
        {"id": "FOOD-202", "cargo": "Food", "location": "Tezpur", "status": "Moving", "risk": "Medium"},
        {"id": "REL-301", "cargo": "Relief", "location": "Tawang", "status": "Delayed", "risk": "Critical"}
    ]

@app.get("/api/incidents")
def get_incidents():
    # Dummy incidents
    return [
        {"id": 1, "type": "Landslide", "location": "West Kameng", "severity": "High"},
        {"id": 2, "type": "Flood", "location": "Dhemaji", "severity": "Medium"}
    ]

@app.post("/api/ai/risk-prediction")
def predict_risk(request: RiskPredictionRequest):
    # Dummy AI risk calculation based on blueprint
    # Rainfall × 30% + Road Condition × 25% + Terrain × 20% + Incident Reports × 25%
    
    score = random.randint(40, 95) # Simulating a dynamic score
    status = "SAFE"
    if score > 80:
        status = "CRITICAL"
    elif score > 60:
        status = "HIGH"
    elif score > 30:
        status = "MODERATE"
        
    return {
        "risk_score": score,
        "status": status,
        "recommendation": "Reroute Immediately" if score > 80 else "Proceed with caution"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
