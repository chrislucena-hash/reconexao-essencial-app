import json

import firebase_admin
from firebase_admin import auth, credentials, firestore

from .config import get_settings


def get_firebase_app() -> firebase_admin.App:
    try:
        return firebase_admin.get_app()
    except ValueError:
        service_account_json = get_settings().firebase_service_account_json
        if service_account_json:
            credential = credentials.Certificate(json.loads(service_account_json))
            return firebase_admin.initialize_app(credential)
        return firebase_admin.initialize_app()


def verify_id_token(token: str) -> dict:
    return auth.verify_id_token(token, app=get_firebase_app())


def get_db() -> firestore.Client:
    settings = get_settings()
    return firestore.client(
        app=get_firebase_app(),
        database_id=settings.firestore_database_id,
    )
