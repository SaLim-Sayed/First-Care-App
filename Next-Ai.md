# AI Integration Architecture (Next.js + Flask + KNN)

## Overview

This architecture separates the frontend, backend API, and AI model into independent layers.

- **Next.js** → User Interface
- **Flask API** → AI Service
- **KNN Model** → Prediction Engine
- **Database** → Store users, datasets, and predictions

---

## High-Level Architecture

```text
                        ┌──────────────────────────────┐
                        │         User Browser         │
                        └──────────────┬───────────────┘
                                       │
                                       │ HTTP Request
                                       ▼
                    ┌────────────────────────────────────┐
                    │             Next.js App            │
                    │                                    │
                    │ - React UI                         │
                    │ - Forms                            │
                    │ - Authentication                   │
                    │ - API Calls                        │
                    └──────────────┬─────────────────────┘
                                   │
                         REST API (Axios / Fetch)
                                   │
                                   ▼
                    ┌────────────────────────────────────┐
                    │            Flask API               │
                    │                                    │
                    │ - Receive Request                  │
                    │ - Validate Input                   │
                    │ - Preprocess Features              │
                    │ - Load Trained KNN Model           │
                    │ - Run Prediction                   │
                    │ - Return JSON Response             │
                    └──────────────┬─────────────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               │                                       │
               ▼                                       ▼
    ┌──────────────────────┐              ┌──────────────────────┐
    │      KNN Model        │              │      Database        │
    │                      │              │                      │
    │ model.pkl            │              │ PostgreSQL/MySQL     │
    │ sklearn              │              │ MongoDB              │
    │ Prediction           │              │ User Data            │
    └──────────────────────┘              │ Training Dataset     │
                                          │ Prediction History   │
                                          └──────────────────────┘
```

---

# Prediction Flow

```text
User
 │
 ▼
Fill Form
 │
 ▼
Next.js
 │
 │ POST /predict
 ▼
Flask API
 │
 ▼
Validate Input
 │
 ▼
Normalize Features
 │
 ▼
Load model.pkl
 │
 ▼
KNN Predict()
 │
 ▼
Prediction Result
 │
 ▼
Return JSON
 │
 ▼
Next.js
 │
 ▼
Display Prediction
```

---

# Request Flow

```text
Next.js

POST /api/predict

{
    "age": 25,
    "salary": 5000,
    "experience": 3
}

            │
            ▼

Flask

@app.route("/predict", methods=["POST"])
```

---

# Flask Internal Flow

```text
Receive JSON
      │
      ▼
Parse Request
      │
      ▼
Feature Engineering
      │
      ▼
Scaler.transform()
      │
      ▼
KNN.predict()
      │
      ▼
Return Prediction
```

---

# Response

```json
{
    "prediction": "Approved",
    "confidence": 0.94
}
```

---

# Folder Structure

```text
project/

frontend/
│
├── app/
├── components/
├── services/
│     api.ts
├── pages/
└── package.json

backend/
│
├── app.py
├── model/
│     model.pkl
│     scaler.pkl
├── routes/
├── services/
├── requirements.txt
└── utils/

database/
```

---

# API Communication

```text
Next.js
      │
      │ Axios
      ▼
http://localhost:5000/predict
      │
      ▼
Flask
      │
      ▼
Prediction
      │
      ▼
JSON Response
```

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js |
| UI | React + Tailwind CSS |
| Backend | Flask |
| AI | Scikit-learn |
| Model | KNN |
| Serialization | Pickle (.pkl) |
| API | REST |
| Database | PostgreSQL / MySQL |
| HTTP Client | Axios |

---

# Complete Workflow

```text
                    User
                      │
                      ▼
          Fill Prediction Form
                      │
                      ▼
                Next.js Frontend
                      │
          POST /predict (Axios)
                      │
                      ▼
                 Flask Backend
                      │
         Validate + Preprocess Data
                      │
                      ▼
              Load KNN Model (.pkl)
                      │
                      ▼
          KNN Predict (scikit-learn)
                      │
                      ▼
             Prediction Generated
                      │
                      ▼
             Save Prediction (Optional)
                      │
                      ▼
                 Database
                      │
                      ▼
             Return JSON Response
                      │
                      ▼
                Next.js Frontend
                      │
                      ▼
          Display Prediction to User
```

---

# Advantages

- Clear separation between UI and AI logic.
- AI model can be updated without modifying the frontend.
- Flask can expose multiple ML endpoints.
- Scalable architecture (Flask can later be replaced with FastAPI).
- Easy deployment using Docker or cloud services.
- Supports additional AI models (Random Forest, SVM, XGBoost, Deep Learning) with minimal frontend changes.
