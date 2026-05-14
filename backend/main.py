from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from sensor_simulation import DASSensorArray
from threat_classifier import AIThreatClassifier

app = FastAPI(title="PetroShield-AI Tactical Command Core", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sensor_array = DASSensorArray()
classifier = AIThreatClassifier()

class AnomalyTriggerRequest(BaseModel):
    anomaly_type: str
    segment_id: str

@app.get("/api/sensors/telemetry")
def get_telemetry():
    """Returns live acoustic spectra and hydraulic pressure across all waypoints."""
    return sensor_array.generate_telemetry()

@app.post("/api/sensors/trigger")
def trigger_anomaly(req: AnomalyTriggerRequest):
    """Triggers an illicit excavation, tapping, or leak anomaly."""
    sensor_array.trigger_anomaly(req.anomaly_type, req.segment_id)
    return {"status": "success", "active_anomaly": req.anomaly_type, "segment_id": req.segment_id}

@app.post("/api/sensors/reset")
def reset_anomaly():
    """Restores nominal baseline operation."""
    sensor_array.reset_anomaly()
    return {"status": "success", "active_anomaly": "none"}

@app.get("/api/threats/analyze")
def analyze_threats():
    """Evaluates telemetry and generates tactical AI appraisal report."""
    telemetry = sensor_array.generate_telemetry()
    return classifier.analyze_telemetry(telemetry)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
