from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import asyncio
import time

from claude_service import analyze_watershed
from epa_service import get_nearby_facilities
from satellite_service import get_water_anomaly_score

load_dotenv()

app = FastAPI(title="Watershed")
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory cache: (lat_key, lng_key) -> (cached_at, response). TTL = 5 min, max 100 entries.
_analyze_cache = {}
_CACHE_TTL_SEC = 300
_CACHE_MAX_SIZE = 100

class AnalysisRequest(BaseModel):
    lat: float
    lng: float
    location_name: str

@app.get("/")
async def root():
    return FileResponse("static/index.html")

def _cache_key(lat: float, lng: float) -> tuple[float, float]:
    """Round to ~1km so nearby clicks reuse cache."""
    return (round(lat, 3), round(lng, 3))

@app.post("/api/analyze")
async def analyze(req: AnalysisRequest):
    try:
        key = _cache_key(req.lat, req.lng)
        now = time.monotonic()
        if key in _analyze_cache:
            cached_at, payload = _analyze_cache[key]
            if now - cached_at < _CACHE_TTL_SEC:
                return payload

        # Run EPA and satellite fetches in parallel (they don't depend on each other)
        loop = asyncio.get_event_loop()
        facilities, anomaly = await asyncio.gather(
            loop.run_in_executor(None, lambda: get_nearby_facilities(req.lat, req.lng, req.location_name)),
            loop.run_in_executor(None, lambda: get_water_anomaly_score(req.lat, req.lng)),
        )

        report = await analyze_watershed(
            lat=req.lat,
            lng=req.lng,
            location_name=req.location_name,
            facilities=facilities,
            anomaly_score=anomaly
        )

        payload = {
            "success": True,
            "report": report,
            "facilities": facilities,
            "anomaly_score": anomaly,
            "risk_level": report["risk_level"],
            "risk_color": _risk_color(report["risk_level"])
        }
        if len(_analyze_cache) >= _CACHE_MAX_SIZE:
            # Evict oldest entry (by cached_at)
            oldest = min(_analyze_cache.items(), key=lambda x: x[1][0])
            del _analyze_cache[oldest[0]]
        _analyze_cache[key] = (now, payload)
        return payload
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
    data_source = body.get("data_source", "").strip() or None
    pdf_bytes = generate_report_pdf(report, location, data_source=data_source)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=watershed-report.pdf"}
    )
