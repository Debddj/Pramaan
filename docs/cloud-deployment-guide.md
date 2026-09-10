# Pramaan Cloud Deployment Guide: Complete Zero-PC Setup

This guide enables you to deploy **Pramaan** so that **your PC is not required at all**. Both the **Web Dashboard** and the **Mobile Scanner Application** will run continuously on the cloud, accessible 24/7 from any device on any cellular network (4G/5G) or WiFi.

---

## Architecture Overview (Zero-PC Production)

```
                       ┌────────────────────────┐
                       │  Managed PostgreSQL DB  │
                       │ (Neon / Supabase/Render)│
                       └───────────▲────────────┘
                                   │
                                   │ (Secure SSL Connection)
                                   ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │           Pramaan FastAPI Enforcement Backend (Render / Railway)       │
 │   - Optical Metrology Engine (EAN-13 37.29mm Calibration)             │
 │   - Statutory Rules Engine (Legal Metrology Rules, 2011)              │
 │   - Gemini VLM / Document AI OCR Pipeline                             │
 │   - Append-Only Cryptographic Audit Trail (SHA-256)                   │
 └───────────────────────▲────────────────────────▲───────────────────────┘
                         │                        │
       (Public HTTPS)    │                        │    (Public HTTPS)
                         │                        │
 ┌───────────────────────▼────────┐      ┌────────▼───────────────────────┐
 │   Pramaan Web Dashboard        │      │   Pramaan Mobile Field App     │
 │ (Vercel / Netlify / Cloudflare)│      │ (Standalone Android APK / Expo)│
 │   - Officer Adjudication       │      │   - Real-time Camera HUD       │
 │   - E-Commerce Surveillance    │      │   - Accelerometer Motion Guard │
 │   - Notice PDF Generator       │      │   - Offline Encrypted Queue    │
 └────────────────────────────────┘      └────────────────────────────────┘
```

---

## Step 1: Deploy Backend & Database to Cloud (Render / Railway)

### Option A: 1-Click Render Deployment using `render.yaml` (Recommended)

The repository includes a ready-to-deploy [`render.yaml`](file:///c:/Users/debnil/projects/Pramaan/render.yaml) file:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Configure zero-PC cloud deployment"
   git push origin main
   ```
2. Log into [Render.com](https://render.com).
3. In the Render Dashboard, click **New +** → **Blueprint**.
4. Connect your GitHub repository (`Pramaan`).
5. Render will automatically detect `render.yaml` and provision:
   - **`pramaan-db`**: A managed PostgreSQL database.
   - **`pramaan-backend`**: The Python FastAPI service with auto-installed dependencies.
   - **`pramaan-dashboard`**: The static web dashboard.
6. Under Environment Variables for `pramaan-backend`, add your Gemini API key:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
7. Click **Apply**.
8. Once deployed, note your backend public URL:
   `https://pramaan-backend.onrender.com`

---

### Option B: Manual Render / Railway / Fly.io Setup

If you prefer deploying services individually:

#### 1. Free Cloud PostgreSQL (Neon.tech or Supabase):
1. Sign up at [Neon.tech](https://neon.tech) (Instant, free cloud PostgreSQL).
2. Create a project named `pramaan`.
3. Copy your Connection String (`postgresql://username:password@ep-xyz.neon.tech/pramaan?sslmode=require`).

#### 2. Deploy FastAPI Backend on Render:
1. In Render, click **New +** → **Web Service**.
2. Point to your GitHub repo.
3. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add Environment Variables:
   - `DATABASE_URL`: `your_neon_or_render_postgres_connection_string`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-3.5-flash`
   - `STORAGE_BACKEND`: `local`
   - `TRIAGE_CONFIDENCE_THRESHOLD`: `0.85`
5. Click **Create Web Service**.
6. **Automatic Seeding**: Pramaan automatically creates all database tables and seeds the default officer account (`officer@consumer.gov.in` / `sih2026`) and standard commodities upon first startup!

---

## Step 2: Deploy Web Dashboard to Vercel / Netlify

The dashboard is a single-page React app that builds into fast static assets (`dist/`).

### Deploying to Vercel:
1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `web-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-app.onrender.com/api/v1`
6. Click **Deploy**.
7. Your web dashboard is now live globally at `https://your-app.vercel.app`!

---

## Step 3: Package & Run Mobile App on Any Smartphone

You have two simple zero-PC ways to run the mobile application on physical Android devices:

### Method 1: Generate a Standalone Android APK (Installs on Any Phone)

With Expo Application Services (EAS), you can compile a production `.apk` in the cloud without needing Android Studio or a local build environment:

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in or create an Expo account:
   ```bash
   eas login
   ```
3. In `mobile-app`, initialize EAS:
   ```bash
   cd mobile-app
   eas build:configure
   ```
4. Build the APK:
   ```bash
   eas build -p android --profile preview
   ```
   *(EAS compiles the APK on Expo's cloud servers and returns a direct download link and QR code).*
5. Scan the QR code with your smartphone to download and install `Pramaan.apk`.
6. Open the app, and it will connect directly to your live cloud backend over 4G/5G/WiFi!

---

### Method 2: Instant Run via Expo Go

If you want to run or test immediately on your phone without building an APK:

1. Install **Expo Go** from Google Play Store or Apple App Store on your phone.
2. In `mobile-app`, start Expo:
   ```bash
   cd mobile-app
   npx expo start
   ```
3. Scan the terminal QR code with your phone camera or the Expo Go app.
4. On the login screen:
   - Tap **"Configure"** under the Target Server bar.
   - Enter your deployed cloud URL: `https://your-backend-app.onrender.com/api/v1`
   - Tap **"Test Ping"** to verify connection, then tap **"Save & Apply"**.
5. Log in with `officer@consumer.gov.in` / `sih2026`.

---

## Verifying the End-to-End Workflow

Once both apps are running in the cloud:

1. **Perform a Field Inspection on Mobile**:
   - Open the Pramaan Mobile App on your phone (on mobile data or any WiFi).
   - Log in and perform an inspection on the **Field Inspection Scanner**.
   - Review the calculated numeral height, detected violations, and cryptographic SHA-256 hash.
   - Tap **"Download Statutory Notice (PDF)"** directly on the phone.

2. **Open the Web Dashboard from Any Browser**:
   - Navigate to `https://your-app.vercel.app` from your phone, tablet, or another computer.
   - The inspection performed on mobile immediately appears in the **Live Stream** and **Recent Inspections**.
   - Review borderline scans in the **Review Queue**, adjudicate them, and export notices.
