from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

def train_svm(X_train, y_train, X_test, y_test, kernel="linear"):
    model = SVC(kernel=kernel, probability=True)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "f1_score": float(f1_score(y_test, y_pred, average="weighted")),
        "precision": float(precision_score(y_test, y_pred, average="weighted")),
        "recall": float(recall_score(y_test, y_pred, average="weighted")),
    }
    hyperparameters = {"kernel": kernel}

    return metrics, hyperparameters
