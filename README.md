# Watershed — Water Safety AI

Watershed is a water safety monitoring platform that lets you click anywhere on a map and get an instant AI-generated risk report for that location. It pulls real data from government sources, analyzes it with Claude AI, and explains the results in plain English that anyone can understand.

Built at RocketHacks 2026 by Ashesh Bhattarai, University of Toledo.

Live demo: https://watershed-production-c55a.up.railway.app

---

## The Problem

Most rivers and waterways in the United States have no active monitoring. When a factory leaks chemicals, when algae blooms form, or when treatment plants fail, communities often find out months later. The data to detect these problems early exists — it just was never connected in one place.

Watershed connects it.

---

## How It Works

You search for any location. Watershed pulls data from three real government sources at the same time, feeds everything to Claude AI, and generates a risk report in about 15 seconds.

The three data sources are:

USGS Water Services — real-time sensor readings from thousands of monitoring stations across the US, measuring streamflow, turbidity, and dissolved oxygen.

EPA ATTAINS — state water quality assessments that classify whether waterways meet safe standards.

EPA ECHO — records of every industrial facility in the US, including their Clean Water Act violations and permit status.

Claude AI from Anthropic takes all of this data and writes a plain-English report explaining the risk level, what the main threats are, which facilities are causing problems, and what actions should be taken.

---

## Features

- Satellite map with color-coded risk circles showing contamination level
- Clickable facility markers showing upstream industrial violators
- AI-generated risk report with key findings and recommended actions
- PDF report download
- Email alert subscription — enter your email and get notified when risk levels change
- Share button to copy a link to the report
- Global water crisis statistics on the homepage

---

## Demo Locations

These locations show interesting results with real data:

Toledo, Ohio — CRITICAL 80/100. Two industrial facilities with combined EPA violations threatening Lake Erie drinking water supply. This is the same area that experienced a major water crisis in 2014.

Pittsburgh, Pennsylvania — MODERATE 60/100. Aging sewer infrastructure and elevated turbidity across the Three Rivers region.

Potomac River, Virginia — LOW 37/100. Clean water, no industrial threats detected.

---

## Tech Stack

Backend: Python, FastAPI
Frontend: HTML, CSS, JavaScript
Map: Mapbox GL satellite imagery
AI: Claude Opus from Anthropic
Email: EmailJS
Deployment: Railway
Data: USGS Water Services API, EPA ATTAINS API, EPA ECHO API, US Census Geocoder

---

## Running Locally
```bash
git clone https://github.com/codeashesh-cloud/watershed.git
cd watershed
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a .env file with these keys:
```
ANTHROPIC_API_KEY=your_key
MAPBOX_TOKEN=your_token
GROQ_API_KEY=your_key
GEMINI_API_KEY=your_key
NASA_TOKEN=placeholder
```

Then run:
```bash
uvicorn main:app --reload --port 8000
```

---

## About

Built in 24 hours at RocketHacks 2026 at the University of Toledo.

The goal was to make water safety data accessible to anyone — not just environmental scientists or government agencies. If you can search Google Maps, you can use Watershed.
