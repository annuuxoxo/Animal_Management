from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from .helpers import get_collection, iso_now, serialize_document


settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


def _collection():
    return get_collection("settings")


DEFAULT_SETTINGS = {
    "facilityName": "Green Valley Animal Care Center",
    "registrationNumber": "FAC-2023-001",
    "address": "123 Animal Care Lane, Green Valley, CA 90210",
    "phone": "(555) 123-4567",
    "email": "contact@greenvalley.com",
    "operatingHours": "Monday - Saturday: 8:00 AM - 6:00 PM",
    "notificationPreferences": {
        "lowStockAlerts": True,
        "healthReminders": True,
        "breedingAlerts": True,
        "feedingReminders": True,
        "emailSummary": False,
    },
    "lastBackup": iso_now(),
}


@settings_bp.get("/")
def get_settings():
    collection = _collection()
    settings = collection.find_one()
    if not settings:
        document = {**DEFAULT_SETTINGS, "createdAt": iso_now(), "updatedAt": iso_now()}
        collection.insert_one(document)
        settings = document
    return jsonify(serialize_document(settings))


@settings_bp.put("/")
def update_settings():
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    collection = _collection()
    updated = collection.find_one_and_update(
        {},
        {"$set": {**payload, "updatedAt": iso_now()}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return jsonify({"error": "Unable to update settings"}), HTTPStatus.INTERNAL_SERVER_ERROR
    return jsonify(serialize_document(updated))


