from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from ..utils.id_generator import get_next_id, timestamp_pair
from .helpers import build_id_filter, get_collection, iso_now, serialize_document


feeding_bp = Blueprint("feeding_tasks", __name__, url_prefix="/api/feeding-tasks")


def _collection():
    return get_collection("feedingtasks")


@feeding_bp.get("/")
def list_feeding_tasks():
    docs = list(_collection().find().sort("createdAt", -1))
    return jsonify([serialize_document(doc) for doc in docs])


@feeding_bp.get("/<task_id>")
def get_feeding_task(task_id: str):
    doc = _collection().find_one(build_id_filter(task_id))
    if not doc:
        return jsonify({"error": "Feeding task not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(doc))


@feeding_bp.post("/")
def create_feeding_task():
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    required_fields = {
        "animalId",
        "animalName",
        "foodType",
        "quantity",
        "time",
        "frequency",
        "status",
        "startDate",
    }
    missing = sorted(required_fields - payload.keys())
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), HTTPStatus.BAD_REQUEST

    collection = _collection()
    new_id = get_next_id(collection, "F", 3)
    created_at, updated_at = timestamp_pair()

    document = {
        **payload,
        "id": new_id,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }
    collection.insert_one(document)
    return jsonify(serialize_document(document)), HTTPStatus.CREATED


@feeding_bp.put("/<task_id>")
def update_feeding_task(task_id: str):
    updates: Dict[str, Any] = request.get_json(silent=True) or {}
    if not updates:
        return jsonify({"error": "No data provided"}), HTTPStatus.BAD_REQUEST

    updates["updatedAt"] = iso_now()
    updated = _collection().find_one_and_update(
        build_id_filter(task_id),
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return jsonify({"error": "Feeding task not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(updated))


@feeding_bp.delete("/<task_id>")
def delete_feeding_task(task_id: str):
    deleted = _collection().find_one_and_delete(build_id_filter(task_id))
    if not deleted:
        return jsonify({"error": "Feeding task not found"}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Feeding task deleted successfully"})


