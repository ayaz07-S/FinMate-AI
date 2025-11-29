@echo off
echo Creating FinMate AI Project Structure...
echo.

REM ===== CREATE DIRECTORIES =====
mkdir frontend\public 2>nul
mkdir frontend\src\components 2>nul
mkdir frontend\src\services 2>nul
mkdir frontend\src\utils 2>nul

mkdir backend\app\models 2>nul
mkdir backend\app\services 2>nul
mkdir backend\app\utils 2>nul
mkdir backend\data 2>nul

mkdir demo\sample-data 2>nul
mkdir demo\screenshots 2>nul

echo [DONE] Directories created!
echo.

REM ===== FRONTEND FILES =====
echo Creating frontend files...

REM package.json
(
echo {
echo   "name": "finmate-frontend",
echo   "version": "1.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "vite build",
echo     "preview": "vite preview"
echo   },
echo   "dependencies": {
echo     "axios": "^1.7.0",
echo     "chart.js": "^4.4.0",
echo     "react": "^18.3.0",
echo     "react-chartjs-2": "^5.3.0",
echo     "react-dom": "^18.3.0",
echo     "react-hot-toast": "^2.4.1",
echo     "zustand": "^4.5.2"
echo   },
echo   "devDependencies": {
echo     "@vitejs/plugin-react": "^4.3.0",
echo     "vite": "^5.3.1",
echo     "tailwindcss": "^3.4.3",
echo     "postcss": "^8.4.33",
echo     "autoprefixer": "^10.4.18"
echo   }
echo }
) > frontend\package.json

REM vite.config.js
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig({
echo   plugins: [react^(^)],
echo   server: {
echo     port: 3000,
echo     proxy: {
echo       '/api': {
echo         target: 'http://localhost:8000',
echo         changeOrigin: true
echo       }
echo     }
echo   }
echo }^)
) > frontend\vite.config.js

REM tailwind.config.js
(
echo /** @type {import('tailwindcss'^).Config} */
echo export default {
echo   content: [
echo     "./index.html",
echo     "./src/**/*.{js,ts,jsx,tsx}",
echo   ],
echo   theme: {
echo     extend: {
echo       colors: {
echo         chaos: '#EF4444',
echo         survival: '#F59E0B',
echo         thrive: '#10B981',
echo       }
echo     },
echo   },
echo   plugins: [],
echo }
) > frontend\tailwind.config.js

REM postcss.config.js
(
echo export default {
echo   plugins: {
echo     tailwindcss: {},
echo     autoprefixer: {},
echo   },
echo }
) > frontend\postcss.config.js

REM index.html
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<title^>FinMate AI - Your Financial Co-Pilot^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>^</div^>
echo     ^<script type="module" src="/src/index.jsx"^>^</script^>
echo   ^</body^>
echo ^</html^>
) > frontend\public\index.html

REM .env
(
echo VITE_API_URL=http://localhost:8000/api
) > frontend\.env

REM index.jsx
(
echo import React from 'react'
echo import ReactDOM from 'react-dom/client'
echo import App from './App'
echo import './index.css'
echo.
echo ReactDOM.createRoot(document.getElementById('root'^)^).render(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>,
echo ^)
) > frontend\src\index.jsx

REM index.css
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo * {
echo   margin: 0;
echo   padding: 0;
echo   box-sizing: border-box;
echo }
echo.
echo body {
echo   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
echo   -webkit-font-smoothing: antialiased;
echo }
) > frontend\src\index.css

REM App.jsx
(
echo import React, { useState } from 'react'
echo import Dashboard from './components/Dashboard'
echo import Onboarding from './components/Onboarding'
echo.
echo function App(^) {
echo   const [hasData, setHasData] = useState(false^)
echo.
echo   return (
echo     ^<div className="min-h-screen bg-gray-50"^>
echo       {!hasData ? (
echo         ^<Onboarding onComplete={(^) =^> setHasData(true^)} /^>
echo       ^) : (
echo         ^<Dashboard /^>
echo       ^)}
echo     ^</div^>
echo   ^)
echo }
echo.
echo export default App
) > frontend\src\App.jsx

REM Dashboard.jsx
(
echo import React from 'react'
echo.
echo export default function Dashboard(^) {
echo   return (
echo     ^<div className="container mx-auto p-6"^>
echo       ^<h1 className="text-3xl font-bold"^>FinMate AI Dashboard^</h1^>
echo       ^<p className="text-gray-600 mt-2"^>Your three financial futures...^</p^>
echo     ^</div^>
echo   ^)
echo }
) > frontend\src\components\Dashboard.jsx

REM Onboarding.jsx
(
echo import React from 'react'
echo.
echo export default function Onboarding({ onComplete }^) {
echo   return (
echo     ^<div className="flex items-center justify-center min-h-screen"^>
echo       ^<div className="bg-white p-8 rounded-lg shadow-lg"^>
echo         ^<h1 className="text-2xl font-bold mb-4"^>Upload Your Income Data^</h1^>
echo         ^<button 
echo           onClick={onComplete}
echo           className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
echo         ^>
echo           Get Started
echo         ^</button^>
echo       ^</div^>
echo     ^</div^>
echo   ^)
echo }
) > frontend\src\components\Onboarding.jsx

REM TimelineView.jsx
(
echo import React from 'react'
echo.
echo export default function TimelineView(^) {
echo   return (
echo     ^<div className="bg-white p-6 rounded-lg shadow"^>
echo       ^<h2 className="text-xl font-bold mb-4"^>Your Three Futures^</h2^>
echo     ^</div^>
echo   ^)
echo }
) > frontend\src\components\TimelineView.jsx

REM CrisisAlert.jsx
(
echo import React from 'react'
echo.
echo export default function CrisisAlert({ crisis }^) {
echo   if (!crisis^) return null
echo.   
echo   return (
echo     ^<div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6"^>
echo       ^<p className="text-red-700 font-semibold"^>Warning: Crisis Detected!^</p^>
echo       ^<p className="text-red-600"^>{crisis.message}^</p^>
echo     ^</div^>
echo   ^)
echo }
) > frontend\src\components\CrisisAlert.jsx

REM ActionsTab.jsx
(
echo import React from 'react'
echo.
echo export default function ActionsTab({ suggestions }^) {
echo   return (
echo     ^<div className="bg-white p-6 rounded-lg shadow mt-6"^>
echo       ^<h2 className="text-xl font-bold mb-4"^>Suggested Actions^</h2^>
echo     ^</div^>
echo   ^)
echo }
) > frontend\src\components\ActionsTab.jsx

REM api.js
(
echo import axios from 'axios'
echo.
echo const API_BASE = import.meta.env.VITE_API_URL ^|^| 'http://localhost:8000/api'
echo.
echo export const api = {
echo   uploadIncome: async (file^) =^> {
echo     const formData = new FormData(^)
echo     formData.append('file', file^)
echo     return axios.post(`${API_BASE}/income/upload`, formData^)
echo   },
echo.   
echo   generateForecast: async (userId = 'demo_user'^) =^> {
echo     return axios.post(`${API_BASE}/forecast/generate`, { user_id: userId }^)
echo   },
echo.   
echo   simulateAction: async (userId, action^) =^> {
echo     return axios.post(`${API_BASE}/simulate`, { user_id: userId, action }^)
echo   }
echo }
) > frontend\src\services\api.js

REM helpers.js
(
echo export const formatCurrency = (amount^) =^> {
echo   return new Intl.NumberFormat('en-IN', {
echo     style: 'currency',
echo     currency: 'INR',
echo     maximumFractionDigits: 0
echo   }^).format(amount^)
echo }
echo.
echo export const formatDate = (dateString^) =^> {
echo   return new Date(dateString^).toLocaleDateString('en-IN', {
echo     day: 'numeric',
echo     month: 'short'
echo   }^)
echo }
) > frontend\src\utils\helpers.js

echo [DONE] Frontend files created!
echo.

REM ===== BACKEND FILES =====
echo Creating backend files...

REM requirements.txt
(
echo fastapi==0.109.0
echo uvicorn[standard]==0.27.0
echo prophet==1.1.5
echo numpy==1.24.3
echo pandas==2.0.3
echo scipy==1.11.4
echo firebase-admin==6.4.0
echo python-dotenv==1.0.0
echo requests==2.31.0
echo pytest==7.4.3
echo httpx==0.26.0
echo pydantic==2.5.3
echo python-multipart==0.0.6
) > backend\requirements.txt

REM .env
(
echo ENVIRONMENT=development
echo FIREBASE_PROJECT_ID=your-project-id
echo FIREBASE_PRIVATE_KEY=your-private-key
echo FIREBASE_CLIENT_EMAIL=your-client-email
) > backend\.env

REM main.py
(
echo from fastapi import FastAPI, UploadFile, File
echo from fastapi.middleware.cors import CORSMiddleware
echo from pydantic import BaseModel
echo import pandas as pd
echo.
echo app = FastAPI(title="FinMate AI API"^)
echo.
echo # CORS
echo app.add_middleware(
echo     CORSMiddleware,
echo     allow_origins=["*"],
echo     allow_credentials=True,
echo     allow_methods=["*"],
echo     allow_headers=["*"],
echo ^)
echo.
echo class ForecastRequest(BaseModel^):
echo     user_id: str
echo.
echo class SimulateRequest(BaseModel^):
echo     user_id: str
echo     action: dict
echo.
echo @app.get("/"^)
echo async def root(^):
echo     return {"message": "FinMate AI API is running"}
echo.
echo @app.post("/api/income/upload"^)
echo async def upload_income(file: UploadFile = File(...^)^):
echo     return {"message": "File uploaded", "filename": file.filename}
echo.
echo @app.post("/api/forecast/generate"^)
echo async def generate_forecast(request: ForecastRequest^):
echo     return {
echo         "scenarios": {
echo             "dates": [],
echo             "pessimistic": [],
echo             "base": [],
echo             "optimistic": []
echo         },
echo         "crisis": None,
echo         "suggestions": []
echo     }
echo.
echo @app.post("/api/simulate"^)
echo async def simulate_action(request: SimulateRequest^):
echo     return {"updated_scenarios": {}}
echo.
echo if __name__ == "__main__":
echo     import uvicorn
echo     uvicorn.run(app, host="0.0.0.0", port=8000^)
) > backend\app\main.py

REM __init__.py files
type nul > backend\app\__init__.py
type nul > backend\app\models\__init__.py
type nul > backend\app\services\__init__.py
type nul > backend\app\utils\__init__.py

REM forecast.py
(
echo """
echo Prophet ML forecasting logic
echo """
echo from prophet import Prophet
echo import pandas as pd
echo import numpy as np
echo.
echo def generate_base_forecast(income_data, periods=90^):
echo     """
echo     Generate base forecast using Prophet
echo     """
echo     # TODO: Implement Prophet forecasting
echo     pass
) > backend\app\models\forecast.py

REM simulator.py
(
echo """
echo Monte Carlo simulation for three scenarios
echo """
echo import numpy as np
echo from scipy import stats
echo.
echo def run_monte_carlo(base_forecast, n_simulations=1000^):
echo     """
echo     Generate pessimistic, base, optimistic scenarios
echo     """
echo     # TODO: Implement Monte Carlo simulation
echo     pass
) > backend\app\models\simulator.py

REM crisis.py
(
echo """
echo Crisis detection logic
echo """
echo.
echo def detect_crisis(pessimistic_scenario^):
echo     """
echo     Detect if user is heading towards financial crisis
echo     """
echo     # TODO: Implement crisis detection
echo     pass
echo.
echo def calculate_days_to_crisis(scenario^):
echo     """
echo     Calculate how many days until balance hits zero
echo     """
echo     # TODO: Implement countdown
echo     pass
) > backend\app\models\crisis.py

REM firebase.py
(
echo """
echo Firebase helper functions
echo """
echo import firebase_admin
echo from firebase_admin import credentials, db
echo.
echo def save_user_data(user_id, data^):
echo     """Save data to Firebase"""
echo     pass
echo.
echo def get_user_data(user_id^):
echo     """Retrieve data from Firebase"""
echo     pass
) > backend\app\services\firebase.py

REM actions.py
(
echo """
echo Action suggestion generation
echo """
echo.
echo def generate_suggestions(crisis_info^):
echo     """
echo     Generate 3 actionable suggestions based on crisis
echo     """
echo     suggestions = [
echo         {
echo             "title": "Take 2 extra weekend shifts",
echo             "impact": "+Rs800",
echo             "description": "Work Saturday and Sunday"
echo         },
echo         {
echo             "title": "Cut Rs450 in non-essentials",
echo             "impact": "+Rs450",
echo             "description": "Skip dining out this week"
echo         },
echo         {
echo             "title": "Delay Rs1200 payment",
echo             "impact": "+Rs1200",
echo             "description": "Negotiate payment extension"
echo         }
echo     ]
echo     return suggestions
) > backend\app\services\actions.py

REM helpers.py
(
echo """
echo Data processing helpers
echo """
echo import pandas as pd
echo.
echo def validate_csv(df^):
echo     """Validate uploaded CSV format"""
echo     required_columns = ['date', 'income']
echo     return all(col in df.columns for col in required_columns^)
echo.
echo def clean_income_data(df^):
echo     """Clean and prepare income data"""
echo     df['date'] = pd.to_datetime(df['date']^)
echo     df = df.sort_values('date'^)
echo     return df
) > backend\app\utils\helpers.py

REM sample_income.csv
(
echo date,income
echo 2024-01-01,450
echo 2024-01-02,520
echo 2024-01-03,380
echo 2024-01-04,650
echo 2024-01-05,490
echo 2024-01-06,720
echo 2024-01-07,580
) > backend\data\sample_income.csv

echo [DONE] Backend files created!
echo.

REM ===== DEMO FILES =====
echo Creating demo files...

(
echo date,income
echo 2024-01-01,450
echo 2024-01-02,520
echo 2024-01-03,380
echo 2024-01-04,650
echo 2024-01-05,490
echo 2024-01-06,720
echo 2024-01-07,580
echo 2024-01-08,430
echo 2024-01-09,560
echo 2024-01-10,620
) > demo\sample-data\rahul_income.csv

echo [DONE] Demo files created!
echo.

REM ===== ROOT FILES =====
echo Creating root files...

REM .gitignore
(
echo # Python
echo __pycache__/
echo *.py[cod]
echo *$py.class
echo *.so
echo .Python
echo env/
echo venv/
echo *.egg-info/
echo .env
echo.
echo # Node
echo node_modules/
echo npm-debug.log
echo .DS_Store
echo dist/
echo build/
echo.
echo # Firebase
echo firebase-key.json
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
) > .gitignore

REM README.md
(
echo # FinMate AI - Financial Crisis Prevention for Gig Workers
echo.
echo ## Quick Start
echo.
echo ### Frontend
echo ```bash
echo cd frontend
echo npm install
echo npm run dev
echo ```
echo.
echo ### Backend
echo ```bash
echo cd backend
echo python -m venv venv
echo venv\Scripts\activate
echo pip install -r requirements.txt
echo python app\main.py
echo ```
echo.
echo ## Demo
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
) > README.md

REM DEMO_SCRIPT.md
(
echo # Demo Script (2 Minutes^)
echo.
echo ## Opening (15 seconds^)
echo "Let me show you Rahul's financial future. Actually, three possible futures."
echo.
echo ## Upload (15 seconds^)
echo [Upload CSV] "These are his last 60 days of Swiggy earnings."
echo.
echo ## Timeline (30 seconds^)
echo "Red line: Where he's heading. Crisis in 12 days.
echo Yellow: Where AI guides him. Crisis avoided.
echo Green: Where he could be. Rs8000 saved."
echo.
echo ## Crisis (20 seconds^)
echo [Point to alert] "AI detected crisis 2 weeks early."
echo.
echo ## Actions (30 seconds^)
echo "AI suggests: Take 2 extra shifts. Watch this."
echo [Click button] "Timeline changed. Rs800 shift = Rs2200 impact."
echo.
echo ## Close (10 seconds^)
echo "Crisis prevented. Autonomously. This is FinMate AI."
) > DEMO_SCRIPT.md

echo [DONE] Root files created!
echo.
echo ========================================
echo    FINMATE AI STRUCTURE CREATED!
echo ========================================
echo.
echo Next steps:
echo 1. cd frontend ^&^& npm install
echo 2. cd backend ^&^& pip install -r requirements.txt
echo 3. Start building!
echo.
echo Frontend will run on: http://localhost:3000
echo Backend will run on: http://localhost:8000
echo.
pause