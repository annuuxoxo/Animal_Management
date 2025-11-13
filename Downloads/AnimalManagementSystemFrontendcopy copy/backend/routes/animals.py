from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from ..utils.id_generator import get_next_id, timestamp_pair
from .helpers import build_id_filter, get_collection, iso_now, serialize_document


animals_bp = Blueprint("animals", __name__, url_prefix="/api/animals")


def _collection():
    return get_collection("animals")


@animals_bp.get("/")
def list_animals():
    docs = list(_collection().find().sort("createdAt", -1))
    return jsonify([serialize_document(doc) for doc in docs])


@animals_bp.get("/<animal_id>")
def get_animal(animal_id: str):
    doc = _collection().find_one(build_id_filter(animal_id))
    if not doc:
        return jsonify({"error": "Animal not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(doc))


@animals_bp.post("/")
def create_animal():
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    required_fields = {"name", "species", "breed", "age", "gender", "status"}
    missing = sorted(required_fields - payload.keys())
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), HTTPStatus.BAD_REQUEST

    collection = _collection()
    new_id = get_next_id(collection, "A", 3)
    created_at, updated_at = timestamp_pair()

    document = {
        **payload,
        "id": new_id,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }

    collection.insert_one(document)
    return jsonify(serialize_document(document)), HTTPStatus.CREATED


@animals_bp.put("/<animal_id>")
def update_animal(animal_id: str):
    updates: Dict[str, Any] = request.get_json(silent=True) or {}
    if not updates:
        return jsonify({"error": "No data provided"}), HTTPStatus.BAD_REQUEST

    updates["updatedAt"] = iso_now()

    updated = _collection().find_one_and_update(
        build_id_filter(animal_id),
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return jsonify({"error": "Animal not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(updated))


@animals_bp.delete("/<animal_id>")
def delete_animal(animal_id: str):
    deleted = _collection().find_one_and_delete(build_id_filter(animal_id))
    if not deleted:
        return jsonify({"error": "Animal not found"}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Animal deleted successfully"})


