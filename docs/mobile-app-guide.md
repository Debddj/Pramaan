# Pramaan Mobile Field Scanner: Complete Architecture & Visual Guide

The **Pramaan Mobile Application** is a specialized statutory inspection tool designed for Legal Metrology officers conducting on-site field inspections of packaged commodities under the **Legal Metrology (Packaged Commodities) Rules, 2011**.

This guide details **how the application works under the hood** (optical metrology, motion guard, rules engine, offline sync) and **how each screen looks visually**.

---

## Part 1: How the Mobile Application Works

### 1. The Optical Metrology Engine (Zero-Caliber Precision)

Under Rule 7(2), Table I of the Legal Metrology Rules, every packaged commodity must print the numeral of the net quantity in a minimum statutory font height (e.g., 2.0mm, 4.0mm, or 6.0mm depending on the area of the Principal Display Panel).

Traditionally, measuring this requires physical calipers or transparent calibration overlays. Pramaan automates this optically:

1. **The Known Universal Reference Standard**:
   According to GS1 General Specifications, standard **EAN-13 barcodes** have a nominal width of **37.29 mm** at 100% magnification.
2. **Sub-Pixel Scale Factor Calculation**:
   When the officer aligns the package barcode inside the HUD reticle, the image detector measures the pixel width of the barcode:
   $$\text{Scale Factor (mm/px)} = \frac{37.29\text{ mm}}{\text{Detected Barcode Width (px)}}$$
3. **Physical Numeral Measurement**:
   Using the derived optical scale factor, the physical height of the net quantity numeral is computed in real millimeters:
   $$\text{Measured Numeral Height (mm)} = \text{Detected Text Height (px)} \times \text{Scale Factor}$$
   *Example*: If text height is 36.0px and scale factor is 0.0500 mm/px, the measured height is **1.80 mm** (flagging a statutory violation if 2.00 mm was mandated).

---

### 2. Accelerometer & Gyroscope Motion Blur Guard

Statutory measurements fail if the image suffers from hand tremor or motion blur. Pramaan integrates real-time hardware telemetry:

- The app polls the device's 3-axis accelerometer at **200ms intervals**.
- It calculates the net gravitational jitter vector:
  $$\text{Jitter} = \sqrt{x^2 + y^2 + (z - 1)^2}$$
- **Threshold**: If $\text{Jitter} \ge 0.18$, the dynamic HUD indicator shifts from **Green (STABLE)** to **Red (MOTION DETECTED)**, and shutter capture is guarded to avoid invalid optical readings.

---

### 3. Dual-Mode Scan Dispatch & OCR Pipeline

The mobile app supports two operational scan modes:
- **Direct Camera Capture (Multipart)**: Captures high-resolution imagery and streams it to `/scan/upload` for on-server OpenCV edge detection, ZBar barcode decoding, and Gemini 1.5/PaddleOCR extraction.
- **Parametric Inspection (JSON)**: Allows instantaneous offline or field-simulation testing by dispatching structured OCR text and optical dimensions to `/scan`.

---

### 4. Offline-First Queue & Cryptographic Evidence Chain

In remote rural markets or warehouse basements where cellular data (4G/5G) is unavailable:
1. When an upload fails, the app automatically diverts the inspection record and local photo cache to an encrypted local queue (`@pramaan_offline_scans`).
2. The HUD displays a badge showing `N QUEUED`.
3. When connectivity is restored, the officer opens the **Offline Queue** and taps **"Sync All Pending to Server"**.
4. Every inspection is timestamped and hashed with **SHA-256** to ensure court-admissible chain of custody under Section 65B of the Indian Evidence Act.
5. Officers can tap **"Download Statutory Notice (PDF)"** directly on the phone to generate an enforcement notice on official letterhead.

---

## Part 2: How the Mobile Application Looks

The mobile app employs an authoritative **Government of India enforcement palette**:
- **Background**: Deep Federal Slate (`#0f172a` and `#020617`).
- **Cards & Surfaces**: Midnight Slate (`#1e293b` with `#334155` borders).
- **Accents**: Imperial Gold / Amber (`#f59e0b`), Officer Blue (`#2563eb`), Reticle Cyan (`#38bdf8`).
- **Verdict States**: Emerald Green (`#065f46`) for COMPLIANT, Crimson Red (`#991b1b`) for VIOLATIONS.

---

### Screen 1: Official Officer Authentication (`LoginScreen.tsx`)

```
┌────────────────────────────────────────────────────────┐
│                   GOVERNMENT OF INDIA                  │
│                         PRAMAAN                        │
│     Legal Metrology Statutory Inspection Field Suite   │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Official Email Address                             │ │
│ │ [ officer@consumer.gov.in                        ] │ │
│ │                                                    │ │
│ │ Security Password                                  │ │
│ │ [ ••••••••                                       ] │ │
│ │                                                    │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │              Authenticate Officer              │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  ● Target Server: https://pramaan-backend.onrender...  │
│    [Configure]                                         │
│                                                        │
│ Under Legal Metrology (Packaged Commodities) Rules, 2011│
└────────────────────────────────────────────────────────┘
```

#### Key Visual Elements:
- **Header Badge**: Gold uppercase badge reading `GOVERNMENT OF INDIA`.
- **Title**: High-contrast, bold typography: `PRAMAAN`.
- **Form Card**: Contained rounded card (`#1e293b`) with clean statutory blue inputs.
- **Server Indicator Bar**: Live pill showing the connected backend endpoint with a **[Configure]** button to test ping or switch between Cloud and Local server presets.

---

### Screen 2: Field Inspection HUD Scanner (`CaptureScreen.tsx`)

```
┌────────────────────────────────────────────────────────┐
│ [● STABLE (CALIBRATION READY)]           [ 2 QUEUED ] │
│                                                        │
│                        ┌     ┐                         │
│                                                        │
│                   ┌ - - - - - - - ┐                    │
│                   : ALIGN BARCODE :                    │
│                   :   (EAN-13)    :                    │
│                   └ - - - - - - - ┘                    │
│                                                        │
│                        └     ┘                         │
│                                                        │
│ ────────────────────────────────────────────────────── │
│     Optical Ruler: EAN-13 nominal 37.29mm scale        │
│                                                        │
│                       ┌───────┐                        │
│                       │  (O)  │  <- Shutter Button     │
│                       └───────┘                        │
└────────────────────────────────────────────────────────┘
```

#### Key Visual Elements:
- **HUD Reticle**: Cyan corner brackets (`#38bdf8`) framing the package label.
- **Barcode Guide Box**: Dashed golden rectangular bracket centered for the EAN-13 barcode.
- **Dynamic Stability Pill**:
  - **Green Dot + "STABLE (CALIBRATION READY)"**: Safe to shoot.
  - **Red Dot + "MOTION DETECTED"**: Motion blur guard active.
- **Offline Queue Badge**: Amber badge indicating scans waiting to sync.
- **Tactile Shutter**: High-visibility white concentric circular button.

---

### Screen 3: Statutory Verdict & Metrology Card (`ResultScreen.tsx`)

```
┌────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐ │
│ │                    VIOLATION                       │ │
│ │ Scan Reference: PRM-4A8F2910                       │ │
│ │ Extraction Confidence: 92%                         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Optical Ruler Calibration                          │ │
│ │ Detected Barcode:          8901030000001           │ │
│ │ Scale Factor:              0.0500 mm/px            │ │
│ │ Measured Numeral Height:   1.80 mm                 │ │
│ │ Principal Display Area:    180.0 cm²               │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Statutory Violations (1)                           │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │ Rule 7(2), Table I                    CRITICAL │ │ │
│ │ │ Numeral height of Net Quantity (1.80mm) is    │ │ │
│ │ │ below statutory minimum of 2.00mm for PDP.     │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Cryptographic Evidence                             │ │
│ │ SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc...    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │         Download Statutory Notice (PDF)            │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │             Perform New Inspection                 │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### Key Visual Elements:
- **Verdict Banner**: Full-width card in Crimson Red (`#991b1b`) for violations, or Forest Emerald (`#065f46`) for full compliance.
- **Optical Metrology Table**: Grid displaying precise millimeter conversions, scale factor, and detected barcode.
- **Violations Section**: Left-bordered cards (`#ef4444`) citing exact rules, legal severity pills (`CRITICAL` / `MODERATE`), and actionable violation descriptions.
- **Cryptographic Evidence**: Monospace SHA-256 hash verifying data integrity.
- **Direct PDF Action**: One-tap download of court-admissible Form I notices.

---

### Screen 4: Offline Queue & Sync Center (`OfflineQueueScreen.tsx`)

```
┌────────────────────────────────────────────────────────┐
│ Offline Inspection Queue                               │
│ Inspections captured without field network coverage    │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ OFFLINE-1725960011                         PENDING │ │
│ │ Barcode: 8901030000001                             │ │
│ │ Captured: 2026-09-10 17:42:10                      │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ OFFLINE-1725960098                          SYNCED │ │
│ │ Barcode: 8901030000002                             │ │
│ │ Captured: 2026-09-10 17:45:30                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │             Sync All Pending to Server             │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │               Purge Synced Records                 │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### Key Visual Elements:
- **Queue Cards**: List of pending/failed/synced inspection records.
- **Status Tags**: Amber `PENDING`, Green `SYNCED`, or Red `FAILED`.
- **Batch Sync Button**: Blue officer button with live loading spinner during cloud synchronization.
