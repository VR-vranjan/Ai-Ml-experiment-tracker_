import firebase_admin
from firebase_admin import credentials, firestore, storage

cred = credentials.Certificate("serviceAccountKey.json")  # Downloaded from Firebase console
firebase_admin.initialize_app(cred, {
    "storageBucket": "<your-project-id>.appspot.com"
})

db = firestore.client()
bucket = storage.bucket()
