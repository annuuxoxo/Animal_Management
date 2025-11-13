from datetime import datetime, timezone
from typing import Any, Dict, Iterable

from bson import ObjectId
from pymongo.collection import Collection

from ..db import get_db

_COLLECTION_ALIASES: Dict[str, Iterable[str]] = {
    "animals": ("animalRegistry", "Animals"),
    "healthrecords": ("healthRecords", "health_records"),
    "feedingtasks": ("feedingTasks", "feeding_schedule"),
    "breedingrecords": ("breedingRecords",),
    "inventoryitems": ("inventory", "inventoryItems"),
    "staffmembers": ("staff", "staffMembers"),
    "settings": ("facilitySettings", "configuration"),
}


def get_collection(name: str) -> Collection:
    """
    Return a MongoDB collection, falling back to legacy naming conventions when present.
    """
    db = get_db()
    available = {coll.casefold(): coll for coll in db.list_collection_names()}
    primary_key = name.casefold()
    if primary_key in available:
        return db[available[primary_key]]

    for alias in _COLLECTION_ALIASES.get(name, ()):
        alias_key = alias.casefold()
        if alias_key in available:
            return db[available[alias_key]]

    # Default: return the requested collection (Mongo will lazily create it if missing)
    return db[name]


def serialize_document(document: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert MongoDB document to JSON-serializable dict, preserving a usable `id` field.
    Removes MongoDB's `_id` field and ensures `id` is a string.
    """
    if document is None:
        return {}

    doc = dict(document)
    
    # Handle _id field
    object_id = doc.pop("_id", None)
    if object_id is not None:
        # Ensure id field exists, use _id if id doesn't exist
        if "id" not in doc:
            doc["id"] = str(object_id)

    # Ensure id is a string (not ObjectId)
    if "id" in doc and isinstance(doc["id"], ObjectId):
        doc["id"] = str(doc["id"])
    
    # Remove any remaining MongoDB-specific fields that shouldn't be exposed
    doc.pop("__v", None)
    
    return doc


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_id_filter(identifier: str) -> Dict[str, Any]:
    """
    Build a filter that matches either the custom `id` field or the Mongo `_id` ObjectId.
    """
    candidates: list[Dict[str, Any]] = [{"id": identifier}]
    if ObjectId.is_valid(identifier):
        candidates.append({"_id": ObjectId(identifier)})

    if len(candidates) == 1:
        return candidates[0]
    return {"$or": candidates}

