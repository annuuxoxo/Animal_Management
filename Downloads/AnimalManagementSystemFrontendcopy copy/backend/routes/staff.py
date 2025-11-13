from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from ..utils.id_generator import get_next_id, timestamp_pair
from .helpers import build_id_filter, get_collection, iso_now, serialize_document


staff_bp = Blueprint("staff", __name__, url_prefix="/api/staff")


def _collection():
    return get_collection("staffmembers")


@staff_bp.get("/")
def list_staff_members():
    docs = list(_collection().find().sort("createdAt", -1))
    return jsonify([serialize_document(doc) for doc in docs])


@staff_bp.get("/<member_id>")
def get_staff_member(member_id: str):
    doc = _collection().find_one(build_id_filter(member_id))
    if not doc:
        return jsonify({"error": "Staff member not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(doc))


@staff_bp.post("/")
def create_staff_member():
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    required_fields = {"name", "role", "email", "phone", "status", "joined"}
    missing = sorted(required_fields - payload.keys())
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), HTTPStatus.BAD_REQUEST

    collection = _collection()
    new_id = get_next_id(collection, "S", 3)
    created_at, updated_at = timestamp_pair()

    document = {
        **payload,
        "id": new_id,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }
    collection.insert_one(document)
    return jsonify(serialize_document(document)), HTTPStatus.CREATED


@staff_bp.put("/<member_id>")
def update_staff_member(member_id: str):
    updates: Dict[str, Any] = request.get_json(silent=True) or {}
    if not updates:
        return jsonify({"error": "No data provided"}), HTTPStatus.BAD_REQUEST

    updates["updatedAt"] = iso_now()
    updated = _collection().find_one_and_update(
        build_id_filter(member_id),
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return jsonify({"error": "Staff member not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(updated))


@staff_bp.delete("/<member_id>")
def delete_staff_member(member_id: str):
    deleted = _collection().find_one_and_delete(build_id_filter(member_id))
    if not deleted:
        return jsonify({"error": "Staff member not found"}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Staff member deleted successfully"})


