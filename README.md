# Watershed — Water Safety AI

Watershed is a web app that gives you an **instant AI water safety report** for any location. It uses real data from NASA, the EPA, and USGS to assess water quality and show nearby industrial facilities, then uses AI to explain the results in plain English.

---

## Deploy to Railway (run it on the web)

Railway will **auto-detect** this project: it sees `requirements.txt` (Python) and `railway.json` (start command), so you don’t need to configure a custom build.

### What you need

- A [Railway](https://railway.app) account (free tier is fine).
- The project in a **GitHub** repo (push your code to GitHub first).
- Your **MAPBOX_TOKEN** and **ANTHROPIC_API_KEY** (same as local setup).

### Steps to deploy

1. **Push this project to GitHub** (if it’s not already there).
   - Create a new repo on [github.com](https://github.com/new), then in your project folder run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```
   - Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name.

2. **Create a project on Railway**
   - Go to [railway.app](https://railway.app) and log in.
   - Click **“New Project”**.
   - Choose **“Deploy from GitHub repo”** and select your **watershed** repo (or the repo that contains this code).
   - Railway will detect it as a Python app and use the start command from `railway.json`.

3. **Add environment variables**
   - In Railway, open your **service** (the one that was created from your repo).
   - Go to the **Variables** tab.
   - Add:
     - `MAPBOX_TOKEN` = your Mapbox token
     - `ANTHROPIC_API_KEY` = your Anthropic API key  
   - Save. Railway will redeploy automatically if it was already building.

4. **Get a public URL**
   - In the same service, go to the **Settings** tab.
   - Under **Networking**, click **“Generate Domain”**.
   - Railway will give you a URL like `https://your-app-name.up.railway.app`.

5. **Run / open your app**
   - After the deploy finishes (green checkmark), click the generated domain or copy it into your browser.
   - You should see the Watershed map. Use **Search** or **click the map** and click **Analyze** to get a water safety report.

### Summary: how Railway runs this app

| What Railway uses | In this project |
|-------------------|-----------------|
| **Language / runtime** | Auto-detected from `requirements.txt` (Python). |
| **Install command** | Default: install dependencies from `requirements.txt`. |
| **Start command** | From `railway.json`: `uvicorn main:app --host 0.0.0.0 --port $PORT`. |
| **Config file** | `railway.json` (build with Nixpacks, start with uvicorn). |

You don’t need to set a custom “build” or “start” command in the Railway UI unless you want to override this; the repo is already set up to be auto-detected and run correctly.

---

## Run it on your computer (local)

### What You Need Before You Start

- **A computer** (Mac, Windows, or Linux)
- **Internet connection**
- **About 10 minutes** to set things up the first time
- **API keys** (free sign-ups; instructions below)

---

## Step 1: Install Python

Python is the programming language this app uses. You need to have it installed.

### On Mac

1. Open **Terminal** (search for "Terminal" in Spotlight).
2. Type: `python3 --version` and press Enter.
3. If you see a version number (e.g. `Python 3.11.5`), you’re done. If you see "command not found":
   - Go to [python.org/downloads](https://www.python.org/downloads/) and download the latest Python 3 for Mac.
   - Run the installer and follow the prompts. When asked, check **"Add Python to PATH"** (or similar).

### On Windows

1. Go to [python.org/downloads](https://www.python.org/downloads/).
2. Download the latest **Python 3** installer for Windows.
3. Run the installer.
4. **Important:** On the first screen, check the box that says **"Add Python to PATH"**, then click "Install Now".
5. When it finishes, close the installer.

### On Linux

Open a terminal and run (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

---

## Step 2: Open the Project Folder in Terminal

You need to work from the folder where the Watershed project lives.

1. Open **Terminal** (Mac/Linux) or **Command Prompt** / **PowerShell** (Windows).
2. Go to the project folder. Replace `YOUR_USERNAME` and path with your actual path if different:

   **Mac/Linux:**
   ```bash
   cd /Users/YOUR_USERNAME/watershed
   ```

   **Windows (Command Prompt):**
   ```cmd
   cd C:\Users\YOUR_USERNAME\watershed
   ```

   **Windows (PowerShell):**
   ```powershell
   cd C:\Users\YOUR_USERNAME\watershed
   ```

3. Confirm you’re in the right place: type `dir` (Windows) or `ls` (Mac/Linux). You should see files like `main.py`, `requirements.txt`, and `README.md`.

---

## Step 3: Create a Virtual Environment (Recommended)

A "virtual environment" keeps this project’s packages separate from the rest of your computer. This avoids conflicts and makes setup clearer.

1. In the same terminal, in the project folder, run:

   **Mac/Linux:**
   ```bash
   python3 -m venv venv
   ```

   **Windows:**
   ```cmd
   python -m venv venv
   ```

2. Activate it:

   **Mac/Linux:**
   ```bash
   source venv/bin/activate
   ```

   **Windows (Command Prompt):**
   ```cmd
   venv\Scripts\activate.bat
   ```

   **Windows (PowerShell):**
   ```powershell
   venv\Scripts\Activate.ps1
   ```

   When it’s active, you’ll usually see `(venv)` at the start of the line in your terminal.

---

## Step 4: Install Dependencies

Dependencies are the extra code (libraries) the app needs to run.

1. Make sure your virtual environment is activated (you see `(venv)`).
2. Run:

   ```bash
   pip install -r requirements.txt
   ```

3. Wait until it finishes. You might see a lot of text; that’s normal. When you get your prompt back with no errors, you’re done.

---

## Step 5: Get Your API Keys and Create `.env`

The app talks to external services (maps, EPA, AI). Each service needs a **key** (like a password) in a file named `.env`.

### 5a. Create the `.env` file

1. In the project folder, create a new file named exactly: **`.env`** (with the dot at the start).
2. **Mac/Linux:** In Terminal you can run:
   ```bash
   touch .env
   ```
   Then open `.env` in any text editor (TextEdit, Notepad, VS Code, etc.).
3. **Windows:** Right‑click in the folder → New → Text Document. Name it `.env` (remove the `.txt`). Open it with Notepad.

### 5b. Add your keys to `.env`

Put the following lines in `.env`, and **replace the placeholder values** with your real keys (one per line, no spaces around `=`):

```env
MAPBOX_TOKEN=your_mapbox_token_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

**Where to get each key:**

| Key | Where to get it | What it’s for |
|-----|-----------------|---------------|
| **MAPBOX_TOKEN** | [mapbox.com](https://www.mapbox.com/) → Sign up → Account → Access tokens → copy "Default public token" | Map and search |
| **ANTHROPIC_API_KEY** | [console.anthropic.com](https://console.anthropic.com/) → Sign up → API Keys → Create key | AI analysis |

**Optional** (app can run with just the two above for basic use):

- `NASA_TOKEN` — [api.nasa.gov](https://api.nasa.gov/) (optional)
- `GEMINI_API_KEY` / `GROQ_API_KEY` — if you add alternative AI providers later

Save the `.env` file and close it. **Do not share this file or put it on the internet**; it contains secrets.

---

## Step 6: Run the App

1. In Terminal/Command Prompt, make sure you’re still in the project folder and the virtual environment is activated (`(venv)`).
2. Start the server:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. You should see something like:
   ```text
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

4. Open your **web browser** (Chrome, Safari, Firefox, Edge).
5. In the address bar type: **`http://localhost:8000`** and press Enter.

You should see the Watershed map and interface. Click anywhere on the map or search for a place (e.g. "Animas River, Colorado") and click **Analyze** to get a water safety report.

---

## Step 7: Stopping the App

- In the terminal where the app is running, press **Ctrl + C**.
- That stops the server. You can run the same `uvicorn` command again whenever you want to start it.

---

## Quick Reference: Commands in Order

If you’ve already done setup once, you usually only need:

```bash
cd /path/to/watershed
source venv/bin/activate    # Mac/Linux
# or: venv\Scripts\activate  # Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Then open: **http://localhost:8000**

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| "python3" or "python" not found | Install Python from [python.org](https://www.python.org/downloads/) and make sure "Add to PATH" was checked. |
| "pip" not found | Run `python3 -m ensurepip` (Mac/Linux) or reinstall Python with "pip" option (Windows). |
| "No module named 'fastapi'" (or similar) | Activate the venv, then run `pip install -r requirements.txt` again. |
| "MAPBOX_TOKEN" or map not loading | Check that `.env` exists in the project folder, has `MAPBOX_TOKEN=...` with a valid token, and that you restarted the server after editing `.env`. |
| "Analysis failed" when clicking Analyze | Check that `ANTHROPIC_API_KEY` is set correctly in `.env` and that you have API credits. |
| Port 8000 already in use | Use another port: `uvicorn main:app --reload --host 0.0.0.0 --port 8001` and open `http://localhost:8001`. |
| **Railway:** Map or “Analysis failed” after deploy | Add `MAPBOX_TOKEN` and `ANTHROPIC_API_KEY` in Railway → your service → **Variables**, then redeploy. |
| **Railway:** Build fails | Ensure `requirements.txt` and `railway.json` are in the repo root. Start command is in `railway.json`; don’t delete it. |

---

## What This App Does (Summary)

- **Map:** You search or click a location.
- **Data:** The app fetches EPA facilities and water data (e.g. USGS) for that area **in parallel** so results load faster.
- **AI:** It sends that data to Claude to produce a short report (risk level, findings, actions).
- **You:** You see the report, risk level, facility markers, and can download a PDF or share a link.

---

## Why It Feels Faster

- **Parallel data loading:** EPA facilities and water/satellite data are fetched at the same time instead of one after the other, so the first result appears sooner.
- **Short timeouts:** External APIs (EPA, USGS) use 6-second timeouts so the app falls back quickly to known data if a service is slow.
- **Connection reuse:** Within each request, repeated calls to the same service reuse one connection where possible.
- **Result cache:** Analyzing the same (or very nearby) location within 5 minutes returns the cached report instantly instead of calling APIs again.
