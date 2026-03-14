from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from claude_service import analyze_watershed
from epa_service import get_nearby_facilities
from satellite_service import get_water_anomaly_score

load_dotenv()

app = FastAPI(title="Watershed")
app.mount("/static", StaticFiles(directory="static"), name="static")

class AnalysisRequest(BaseModel):
    lat: float
    lng: float
    location_name: str

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.post("/api/analyze")
async def analyze(req: AnalysisRequest):
    try:
        facilities = get_nearby_facilities(req.lat, req.lng, req.location_name)
        anomaly = get_water_anomaly_score(req.lat, req.lng)
        report = await analyze_watershed(
            lat=req.lat,
            lng=req.lng,
            location_name=req.location_name,
            facilities=facilities,
            anomaly_score=anomaly
        )
        return {
            "success": True,
            "report": report,
            "facilities": facilities,
            "anomaly_score": anomaly,
            "risk_level": report["risk_level"],
            "risk_color": _risk_color(report["risk_level"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _risk_color(level: str) -> str:
    return {"LOW": "#22c55e", "MODERATE": "#f59e0b",
            "HIGH": "#ef4444", "CRITICAL": "#7c3aed"}.get(level, "#6b7280")

@app.get("/api/mapbox-token")
async def mapbox_token():
    return {"token": os.getenv("MAPBOX_TOKEN")}


from fastapi.responses import Response
from pdf_service import generate_report_pdf
import json

@app.post("/api/generate-pdf")
async def generate_pdf(request: Request):
    body = await request.json()
    report = body.get("report")
    location = body.get("location_name", "Unknown Location")
    pdf_bytes = generate_report_pdf(report, location)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=watershed-report.pdf"}
    )
