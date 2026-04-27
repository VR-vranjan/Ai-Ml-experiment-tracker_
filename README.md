# 🚀 AI/ML Experiment Tracker

A full-stack web application to **upload datasets, train multiple ML models, and visualize performance metrics** in an interactive dashboard.

---

## 📌 Project Overview

The AI/ML Experiment Tracker allows users to:

- Upload CSV datasets  
- Automatically train multiple ML models  
- Track experiment performance  
- Visualize metrics using interactive charts  
- Manage experiments (view, delete, analyze)  

This project combines **Machine Learning + Full Stack Development + Cloud Integration**, making it ideal for real-world ML workflows.

---

## 🧠 Features

### 🔹 Authentication
- User signup & login using Firebase Authentication

### 🔹 Dataset Upload & Processing
- Upload CSV datasets
- Automatic preprocessing:
  - Missing value handling
  - Encoding categorical variables
  - Feature scaling

### 🔹 ML Model Training
Trains multiple models automatically:
- Logistic Regression  
- K-Nearest Neighbors (KNN)  
- Support Vector Machine (SVM)  
- Decision Tree  
- Random Forest  

### 🔹 Metrics Calculation
For each model:
- Accuracy  
- Precision  
- Recall  
- F1 Score  

---

### 📊 Dashboard & Visualization
- Experiment summary cards:
  - Total experiments
  - Completed / In-progress
- Charts:
  - Status Pie Chart
  - Performance Trend Line Chart
  - Model-wise Metrics Charts
- Intelligent insights:
  - Best performing model
  - Dataset performance trends
  - Anomaly detection

---

### 🗂 Experiment Management
- View all experiments  
- Delete experiments  
- Detailed experiment view  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Recharts  

### Backend
- FastAPI  
- Python  

### Machine Learning
- Scikit-learn  
- Pandas  
- NumPy  

### Database & Auth
- Firebase Firestore  
- Firebase Authentication  

---

## 📁 Project Structure

```
AI-ML-Experiment-Tracker/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│
├── ml_backend/
│   ├── main.py
│   ├── models/
│   │   ├── logistic_regression.py
│   │   ├── knn.py
│   │   ├── svm.py
│   │   ├── decision_tree.py
│   │   └── random_forest.py
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone Repository
```bash
git clone https://github.com/VR-vranjan/Ai-Ml-experiment-tracker_.git
cd Ai-Ml-experiment-tracker_
```

---

### 🔹 2. Backend Setup (FastAPI)

```bash
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

Run backend:
```bash
uvicorn ml_backend.main:app --reload
```

---

### 🔹 3. Frontend Setup (React)

```bash
npm install
npm run dev
```

---

### 🔹 4. Firebase Setup

- Create project in Firebase
- Enable Authentication (Email/Password)
- Enable Firestore Database
- Add config in:

```js
src/services/firebase.js
```

---

## 📊 Dataset Format

- Must be CSV file  
- Last column should be target variable  
- Must contain at least 2 classes  

---

## ⚠️ Important Notes

- Dataset must have:
  - At least 1 feature column  
  - 1 target column  
- Target column must have multiple classes  

---

## 🚀 Future Improvements

- Model comparison dashboard  
- Hyperparameter tuning UI  
- Model export/download  
- Docker-based execution environment  
- Deployment (Vercel + Render)  

---

## 👩‍💻 Author

**Vaishnavi Ranjan**  
B.E. Computer Engineering (2022–2026)    

---

## 📬 Contact

📧 vranjan00700@gmail.com  
🔗 https://github.com/VR-vranjan  

---

## ⭐ Why This Project Stands Out

- Combines **AI/ML + Full Stack + Cloud**
- Real-world experiment tracking system
- Interactive dashboards with insights
- Scalable and production-ready architecture
