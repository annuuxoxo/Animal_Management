from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from ..utils.id_generator import get_next_id, timestamp_pair
from .helpers import build_id_filter, get_collection, iso_now, serialize_document


health_bp = Blueprint("health_records", __name__, url_prefix="/api/health-records")


def _collection():
    return get_collection("healthrecords")


@health_bp.get("/")
def list_health_records():
    docs = list(_collection().find().sort("createdAt", -1))
    return jsonify([serialize_document(doc) for doc in docs])


@health_bp.get("/<record_id>")
def get_health_record(record_id: str):
    doc = _collection().find_one(build_id_filter(record_id))
    if not doc:
        return jsonify({"error": "Health record not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(doc))


@health_bp.post("/")
def create_health_record():
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    required_fields = {"animalId", "recordType", "description", "date", "veterinarian", "status"}
    missing = sorted(required_fields - payload.keys())
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), HTTPStatus.BAD_REQUEST

    collection = _collection()
    new_id = get_next_id(collection, "H", 3)
    created_at, updated_at = timestamp_pair()

    document = {
        **payload,
        "id": new_id,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }
    collection.insert_one(document)
    return jsonify(serialize_document(document)), HTTPStatus.CREATED


@health_bp.put("/<record_id>")
def update_health_record(record_id: str):
    updates: Dict[str, Any] = request.get_json(silent=True) or {}
    if not updates:
        return jsonify({"error": "No data provided"}), HTTPStatus.BAD_REQUEST

    updates["updatedAt"] = iso_now()
    updated = _collection().find_one_and_update(
        build_id_filter(record_id),
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return jsonify({"error": "Health record not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(updated))


@health_bp.delete("/<record_id>")
def delete_health_record(record_id: str):
    deleted = _collection().find_one_and_delete(build_id_filter(record_id))
    if not deleted:
        return jsonify({"error": "Health record not found"}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Health record deleted successfully"})


