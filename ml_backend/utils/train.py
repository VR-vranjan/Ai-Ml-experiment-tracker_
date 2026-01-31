import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def run_experiment(df: pd.DataFrame, algo="random_forest"):
    if "target" not in df.columns:
        raise ValueError("CSV must contain a 'target' column")

    X = df.drop(columns=["target"])
    y = df["target"]

    if len(y.unique()) < 2:
        raise ValueError("Dataset must have at least 2 classes for classification")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    if algo == "random_forest":
        model = RandomForestClassifier(n_estimators=100, random_state=42)
    elif algo == "logistic_regression":
        model = LogisticRegression(max_iter=1000)
    else:
        raise ValueError(f"Algorithm '{algo}' not supported")

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="weighted")),
        "recall": float(recall_score(y_test, y_pred, average="weighted")),
        "f1_score": float(f1_score(y_test, y_pred, average="weighted")),
    }

    # Feature importances for RandomForest
    if algo == "random_forest":
        metrics["model_params"] = {f"feature_{i}": float(imp) for i, imp in enumerate(model.feature_importances_)}

    return metrics
