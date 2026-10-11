# SmartUro — Urinalysis Records & Decision-Support System
> **Academic Final Year Capstone Project (B.Tech Computer Science & Health Informatics)**  
> Built with **React (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 📌 Project Overview

**SmartUro** is an academic urinalysis decision-support web application designed to simplify the capture, evaluation, and review of routine urine dipstick tests.

### Key Objectives:
- **Centralized Data Storage**: Persists patient test records reliably in MongoDB.
- **Automated Rule Engine**: Uses standard clinical reference thresholds to deterministically flag abnormal readings (no complex black-box ML models).
- **Streamlined College Interface**: Clean, accessible, bare-minimum user interface focused on high usability:
  - 📋 **Urinalysis Records**: Search, filter by abnormal/pending status, and view patient test histories.
  - ➕ **New Test Entry**: Intuitive form with sample data presets (Normal, UTI, Diabetic) for viva/demo testing.
  - 📖 **Clinical Reference Ranges**: Documented clinical thresholds for all 10 standard dipstick analytes.
  - ℹ️ **Project Abstract & Architecture**: Full MERN stack documentation and project credits.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend API** | Node.js, Express.js, CORS |
| **Database** | MongoDB with Mongoose ODM (includes in-memory fallback) |
| **Dataset** | 500-record clinical urinalysis benchmark dataset (`data/dataset.csv`) |

---

## 🔬 Clinical Reference Rules

All analyte evaluations run on the backend (`server/src/utils/flagEngine.js`) against standard clinical criteria:

| Analyte | Full Name | Normal Reference Range | Flag Condition |
|---|---|---|---|
| **LEU** | Leucocytes | `Negative` | Abnormal if `++` or `+++` |
| **NIT** | Nitrite | `Negative` | Abnormal if `Positive` |
| **URO** | Urobilinogen | `0.1 – 1.0 mg/dL` | Abnormal if out of range |
| **PRO** | Protein | `≤ 14 mg/dL` | Abnormal if `> 14 mg/dL` |
| **pH** | Urinary pH | `4.5 – 8.0` | Abnormal if `< 4.5` or `> 8.0` |
| **BLO** | Blood | `Negative` | Abnormal if `Trace`, `+`, or `++` |
| **SG** | Specific Gravity | `1.005 – 1.030` | Abnormal if `< 1.005` or `> 1.030` |
| **KET** | Ketones | `≤ 0 mg/dL` | Abnormal if `> 0 mg/dL` |
| **BIL** | Bilirubin | `≤ 0 mg/dL` | Abnormal if `> 0 mg/dL` |
| **GLU** | Glucose | `≤ 0 mg/dL` | Abnormal if `> 0 mg/dL` |

*If any analyte is abnormal, the record is flagged and set to **Pending Review** until signed off by a clinician.*

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js installed (`node -v`)
- MongoDB running locally at `mongodb://localhost:27017` (or uses built-in memory fallback)

### 1. Start Backend (Node.js & Express)
```bash
cd server
npm install
npm run seed     # Seeds 500 records from dataset.csv into MongoDB
npm start        # Starts Express server on http://localhost:5000
```

### 2. Start Frontend (React & Vite)
In a second terminal:
```bash
cd client
npm install
npm run dev      # Starts React client on http://localhost:3000
```
Open **`http://localhost:3000`** in your browser.

---

## 📡 REST API Endpoints

- `GET /api/stats/summary` — Returns total tests, normal, abnormal, and pending review counts.
- `GET /api/readings` — Retrieves paginated test records (supports `?search=`, `?filter=abnormal|normal|pending`).
- `GET /api/readings/:id` — Returns single test record with all 10 analyte flag evaluations.
- `POST /api/readings` — Submits a new urinalysis reading; calculates flags and stores in MongoDB.
- `PATCH /api/readings/:id/review` — Marks a record as reviewed with attending clinician name and notes.
- `GET /api/health` — Health check status.
