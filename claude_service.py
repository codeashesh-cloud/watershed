import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def _score_to_risk(score: int) -> str:
    if score >= 80: return "CRITICAL"
    if score >= 65: return "HIGH"
    if score >= 40: return "MODERATE"
    return "LOW"

async def analyze_watershed(lat, lng, location_name, facilities, anomaly_score) -> dict:
    facilities_text = "\n".join([
        f"- {f['name']} ({f['type']}): {f['violations']} violations, Status: {f['permit_status']}"
        for f in facilities
    ]) or "No major facilities detected in radius"

    risk_level = _score_to_risk(anomaly_score['score'])

    prompt = f"""You are an expert environmental scientist. Analyze this watershed data.
The risk level has been DETERMINED by satellite data as: {risk_level}
You MUST use exactly "{risk_level}" as the risk_level in your response. Do not change it.

LOCATION: {location_name} (lat: {lat}, lng: {lng})

SATELLITE ANOMALY DATA:
- Overall anomaly score: {anomaly_score['score']}/100
- Turbidity index: {anomaly_score['turbidity_index']}
- Algae bloom risk: {anomaly_score['algae_risk']}
- Chemical contamination index: {anomaly_score['chemical_index']}

UPSTREAM INDUSTRIAL FACILITIES ({len(facilities)} detected):
{facilities_text}

Respond with ONLY this JSON, no other text:
{{
  "risk_level": "{risk_level}",
  "risk_score": {anomaly_score['score']},
  "headline": "one powerful sentence about {location_name} water safety",
  "summary": "2-3 sentence plain English summary for citizens",
  "key_findings": ["specific finding with data", "specific finding with data", "specific finding with data"],
  "primary_threat": "the single biggest contamination concern",
  "contaminants_of_concern": ["contaminant 1", "contaminant 2"],
  "affected_radius_km": 15,
  "population_at_risk": "estimated range",
  "recommended_actions": ["most urgent action", "action 2", "action 3"],
  "monitoring_frequency": "how often this should be checked",
  "regulatory_violations": "summary of EPA violation concerns",
  "confidence_note": "one sentence on data confidence"
}}"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    text = message.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
