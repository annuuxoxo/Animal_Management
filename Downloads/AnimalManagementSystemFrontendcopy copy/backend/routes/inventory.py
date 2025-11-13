from http import HTTPStatus
from typing import Any, Dict, Optional, Tuple

from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from ..utils.id_generator import get_next_id, timestamp_pair
from .helpers import build_id_filter, get_collection, iso_now, serialize_document


inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")


def _collection():
    return get_collection("inventoryitems")


def _compute_status(quantity: float, reorder_level: float) -> str:
    if quantity <= 0:
        return "Out of Stock"
    if quantity <= reorder_level:
        return "Low Stock"
    return "In Stock"


def _extract_numbers(payload: Dict[str, Any], existing: Optional[Dict[str, Any]] = None) -> Tuple[float, float]:
    def _number(value, fallback):
        try:
            return float(value)
        except (TypeError, ValueError):
            return float(fallback)

    base_quantity = existing["quantity"] if existing else 0
    base_reorder = existing["reorderLevel"] if existing else 0

    quantity = _number(payload.get("quantity", base_quantity), base_quantity)
    reorder_level = _number(payload.get("reorderLevel", base_reorder), base_reorder)
    return quantity, reorder_level


@inventory_bp.get("/")
def list_inventory():
    docs = list(_collection().find().sort("createdAt", -1))
    return jsonify([serialize_document(doc) for doc in docs])


@inventory_bp.get("/<item_id>")
def get_inventory_item(item_id: str):
    doc = _collection().find_one(build_id_filter(item_id))
    if not doc:
        return jsonify({"error": "Inventory item not found"}), HTTPStatus.NOT_FOUND
    return jsonify(serialize_document(doc))


@inventory_bp.post("/")
def create_inventory_item():
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    required_fields = {"name", "category", "quantity", "unit", "reorderLevel", "costPerUnit"}
    missing = sorted(required_fields - payload.keys())
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), HTTPStatus.BAD_REQUEST

    collection = _collection()
    new_id = get_next_id(collection, "I", 3)
    created_at, updated_at = timestamp_pair()
    quantity, reorder_level = _extract_numbers(payload)

    document = {
        **payload,
        "quantity": quantity,
        "reorderLevel": reorder_level,
        "status": _compute_status(quantity, reorder_level),
        "id": new_id,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }
    collection.insert_one(document)
    return jsonify(serialize_document(document)), HTTPStatus.CREATED


@inventory_bp.put("/<item_id>")
def update_inventory_item(item_id: str):
    updates: Dict[str, Any] = request.get_json(silent=True) or {}
    if not updates:
        return jsonify({"error": "No data provided"}), HTTPStatus.BAD_REQUEST

    collection = _collection()
    existing = collection.find_one(build_id_filter(item_id))
    if not existing:
        return jsonify({"error": "Inventory item not found"}), HTTPStatus.NOT_FOUND

    quantity, reorder_level = _extract_numbers(updates, existing)
    updates["quantity"] = quantity
    updates["reorderLevel"] = reorder_level
    updates["status"] = _compute_status(quantity, reorder_level)
    updates["updatedAt"] = iso_now()

    updated = collection.find_one_and_update(
        build_id_filter(item_id),
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    return jsonify(serialize_document(updated))


@inventory_bp.delete("/<item_id>")
def delete_inventory_item(item_id: str):
    deleted = _collection().find_one_and_delete(build_id_filter(item_id))
    if not deleted:
        return jsonify({"error": "Inventory item not found"}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Inventory item deleted successfully"})


