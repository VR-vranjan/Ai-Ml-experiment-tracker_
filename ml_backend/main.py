from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import hashlib
import firebase_admin
from firebase_admin import credentials, firestore
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# ✅ Corrected imports (must include ml_backend prefix)
from ml_backend.models.logistic_regression import train_logistic
from ml_backend.models.knn import train_knn
from ml_backend.models.svm import train_svm
from ml_backend.models.decision_tree import train_decision_tree
from ml_backend.models.random_forest import train_random_forest

# ✅ Initialize Firebase
cred = credentials.Certificate("ml_backend/firebase-admin-sdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ✅ FastAPI App
app = FastAPI()

# ✅ CORS Setup
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Helper: Clean metrics for JSON compatibility
def clean_metrics(metrics):
    if isinstance(metrics, dict):
        return {k: clean_metrics(v) for k, v in metrics.items()}
    elif isinstance(metrics, (float, np.floating)):
        if np.isnan(metrics) or np.isinf(metrics):
            return None
        return float(metrics)
    else:
        return metrics


# ✅ Route: Upload Dataset & Train Models
@app.post("/upload-dataset/")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        file_bytes = await file.read()
        experiment_hash = hashlib.md5(file_bytes).hexdigest()
        df = pd.read_csv(pd.io.common.BytesIO(file_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    if df.shape[1] < 2:
        raise HTTPException(status_code=400, detail="Dataset must have at least 1 feature and 1 target column.")

    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]

    # ✅ Clean column names & target values
    df.columns = df.columns.str.strip()
    y = y.astype(str).str.strip()

    # ✅ Identify numeric & categorical columns
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = X.select_dtypes(exclude=[np.number]).columns.tolist()

    transformers = []
    if numeric_features:
        numeric_transformer = Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', numeric_transformer, numeric_features))

    if categorical_features:
        categorical_transformer = Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OneHotEncoder(handle_unknown='ignore'))
        ])
        transformers.append(('cat', categorical_transformer, categorical_features))

    if transformers:
        preprocessor = ColumnTransformer(transformers=transformers)
        X = preprocessor.fit_transform(X)
    else:
        X = X.values  # Only numeric data, no transformation needed

    # ✅ Encode target properly
    if y.nunique() > 1:
        try:
            # Try numeric encoding if possible
            y = pd.to_numeric(y, errors='ignore')
            if y.dtype == 'object':
                y = LabelEncoder().fit_transform(y)
        except Exception:
            y = LabelEncoder().fit_transform(y)
    else:
        # Single-class safeguard
        raise HTTPException(status_code=400, detail="Target column contains only one unique class. Please upload a dataset with at least 2 classes.")

    # ✅ Stratified split (ensures both classes in train/test)
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    except Exception:
        # fallback if stratify fails (e.g., very small dataset)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

    # ✅ Model dictionary
    models = {
        "logistic_regression": train_logistic,
        "knn": train_knn,
        "svm": train_svm,
        "decision_tree": train_decision_tree,
        "random_forest": train_random_forest
    }

    all_metrics = {}
    all_hyperparameters = {}

    # ✅ Train all models safely
    for name, train_fn in models.items():
        try:
            metrics, hyperparams = train_fn(X_train, y_train, X_test, y_test)
            all_metrics[name] = metrics
            all_hyperparameters[name] = hyperparams
        except Exception as e:
            all_metrics[name] = {"error": str(e)}
            all_hyperparameters[name] = {}

    all_metrics = clean_metrics(all_metrics)

    # ✅ Save experiment to Firestore
    experiment_name = file.filename.rsplit('.', 1)[0]
    try:
        db.collection("experiments").document(experiment_name).set({
            "experimentId": experiment_hash,
            "name": experiment_name,
            "metrics": all_metrics,
            "hyperparameters": all_hyperparameters,
            "status": "Completed",
            "fileUrl": "",
            "createdAt": firestore.SERVER_TIMESTAMP
        }, merge=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving to Firestore: {str(e)}")

    # ✅ Return response
    return {
        "message": "Models trained and metrics saved successfully!",
        "experimentId": experiment_hash,
        "metrics": all_metrics,
        "hyperparameters": all_hyperparameters
    }
