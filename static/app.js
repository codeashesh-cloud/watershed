let map, currentMarker;

async function initMap() {
  const res = await fetch('/api/mapbox-token');
  const { token } = await res.json();
  mapboxgl.accessToken = token;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [-98.5795, 39.8283],
    zoom: 4
  });

  map.on('click', async (e) => {
    const { lat, lng } = e.lngLat;
    const name = await reverseGeocode(lng, lat);
    await analyzeLocation(lat, lng, name);
  });
}

async function reverseGeocode(lng, lat) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    return data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

async function searchLocation() {
  const query = document.getElementById('location-input').value.trim();
  if (!query) return;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    const place = data.features?.[0];
    if (!place) { alert('Location not found. Try a different search.'); return; }
    const [lng, lat] = place.center;
    map.flyTo({ center: [lng, lat], zoom: 10, duration: 1500 });
    await analyzeLocation(lat, lng, place.place_name);
  } catch (e) {
    alert('Search failed. Try clicking on the map.');
  }
}

async function analyzeLocation(lat, lng, name) {
  showLoading();
  placeMarker(lng, lat);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, location_name: name })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Analysis failed');
    renderReport(data);
    document.getElementById("alert-btn").style.display = "block";
    drawRiskCircle(lng, lat, data.risk_level, data.anomaly_score.score);
    drawFacilityMarkers(data.facilities);
    map.flyTo({ center: [lng, lat], zoom: 10, duration: 1200 });
  } catch (e) {
    hideLoading();
    alert('Analysis failed. Check your API keys and try again.');
  }
}

function renderReport(data) {
  hideLoading();
  const r = data.report;
  const colors = {
    LOW: '#22c55e', MODERATE: '#f59e0b',
    HIGH: '#ef4444', CRITICAL: '#7c3aed'
  };
  const bg = {
    LOW: '#052e16', MODERATE: '#1c1007',
    HIGH: '#1c0404', CRITICAL: '#1a0536'
  };
  const c = colors[r.risk_level] || '#6b7280';

  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('empty-state').classList.add('hidden');

  const card = document.getElementById('risk-card');
  card.style.background = bg[r.risk_level] || '#1e2030';
  card.style.borderColor = c + '40';

  const badge = document.getElementById('risk-badge');
  badge.textContent = r.risk_level;
  badge.style.background = c + '20';
  badge.style.color = c;

  document.getElementById('risk-score-display').textContent = r.risk_score + '/100';
  document.getElementById('risk-score-display').style.color = c;
  document.getElementById('risk-headline').textContent = r.headline;
  document.getElementById('risk-summary').textContent = r.summary;

  const a = data.anomaly_score;
  document.getElementById('m-turbidity').textContent = a.turbidity_index;
  document.getElementById('m-algae').textContent = a.algae_risk;
  document.getElementById('m-chemical').textContent = a.chemical_index;
  document.getElementById('m-facilities').textContent = data.facilities.length;

  document.getElementById('findings-list').innerHTML =
    (r.key_findings || []).map(f =>
      `<div class="finding"><span class="finding-dot">▸</span><span>${f}</span></div>`
    ).join('');

  document.getElementById('primary-threat').textContent = r.primary_threat;

  document.getElementById('actions-list').innerHTML =
    (r.recommended_actions || []).map((a, i) =>
      `<div class="action"><span class="action-num">${i + 1}.</span><span>${a}</span></div>`
    ).join('');

  document.getElementById('footer-source').textContent = a.data_source;
  document.getElementById('footer-confidence').textContent = 'Confidence: ' + a.confidence;
}

function drawFacilityMarkers(facilities) {
  if (window.facilityMarkers) { window.facilityMarkers.forEach(m => m.remove()); }
  window.facilityMarkers = [];
  facilities.forEach(f => {
    const color = f.violations > 10 ? "#ef4444" : f.violations > 3 ? "#f59e0b" : "#22c55e";
    const el = document.createElement("div");
    el.style.cssText = `width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;cursor:pointer;box-shadow:0 0 6px ${color};`;
    const popup = new mapboxgl.Popup({offset:10}).setHTML(`<div style="font-size:12px;line-height:1.6"><strong>${f.name}</strong><br>Type: ${f.type}<br>Violations: <span style="color:${color};font-weight:600">${f.violations}</span><br>Status: ${f.permit_status}</div>`);
    new mapboxgl.Marker(el).setLngLat([f.lng, f.lat]).setPopup(popup).addTo(map);
  });
}

function drawRiskCircle(lng, lat, level, score) {
  if (map.getLayer('risk-circle')) {
    map.removeLayer('risk-circle');
    map.removeSource('risk-circle');
  }
  const colors = {
    LOW: '#22c55e', MODERATE: '#f59e0b',
    HIGH: '#ef4444', CRITICAL: '#7c3aed'
  };
  map.addSource('risk-circle', {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] } }
  });
  map.addLayer({
    id: 'risk-circle', type: 'circle', source: 'risk-circle',
    paint: {
      'circle-radius': 40 + score * 0.4,
      'circle-color': colors[level] || '#6b7280',
      'circle-opacity': 0.25,
      'circle-stroke-width': 2,
      'circle-stroke-color': colors[level] || '#6b7280',
      'circle-stroke-opacity': 0.8
    }
  });
}

function placeMarker(lng, lat) {
  if (currentMarker) currentMarker.remove();
  currentMarker = new mapboxgl.Marker({ color: '#0ea5e9' })
    .setLngLat([lng, lat]).addTo(map);
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('empty-state').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

initMap();

function showAlertSignup() {
  const existing = document.getElementById('alert-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'alert-modal';
  modal.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.7); z-index:9999;
    display:flex; align-items:center; justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:#1a1a2e; border:1px solid #333; border-radius:12px; padding:32px; width:320px;">
      <h3 style="color:white; margin:0 0 8px 0;">🔔 Get Water Alerts</h3>
      <p style="color:#aaa; font-size:13px; margin:0 0 20px 0;">Get notified when risk levels change for this location.</p>
      <input id="alert-email" type="email" placeholder="your@email.com" style="
        width:100%; padding:10px; border-radius:8px;
        background:#0d0d1a; border:1px solid #444;
        color:white; font-size:14px; box-sizing:border-box; margin-bottom:12px;
      "/>
      <button onclick="submitAlert()" style="
        width:100%; padding:10px; background:#3b82f6;
        color:white; border:none; border-radius:8px;
        font-size:14px; cursor:pointer; margin-bottom:8px;
      ">Subscribe to Alerts</button>
      <button onclick="document.getElementById('alert-modal').remove()" style="
        width:100%; padding:10px; background:transparent;
        color:#aaa; border:1px solid #333; border-radius:8px;
        font-size:14px; cursor:pointer;
      ">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function submitAlert() {
  const email = document.getElementById('alert-email').value;
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }
  document.getElementById('alert-modal').remove();
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px;
    background:#22c55e; color:white; padding:14px 20px;
    border-radius:10px; font-size:14px; z-index:9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  toast.textContent = `✅ Alert set! We'll notify ${email} of changes.`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function shareReport() {
  const loc = document.getElementById("location-input").value;
  const url = window.location.origin + "?location=" + encodeURIComponent(loc);
  try { navigator.clipboard.writeText(url); } catch(e) { prompt("Copy this link:", url); }
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:#3b82f6;color:white;padding:14px 20px;border-radius:10px;font-size:14px;z-index:9999;";
  toast.textContent = "🔗 Report link copied!";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
