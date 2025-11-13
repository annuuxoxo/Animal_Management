from datetime import datetime, timezone
from typing import Tuple

from pymongo.collection import Collection


def _parse_id(doc_id: str, prefix: str) -> int:
    """
    Extract the numeric portion of an identifier like 'A001'.
    """
    if not doc_id.startswith(prefix):
        return 0
    try:
        return int(doc_id[len(prefix):])
    except ValueError:
        return 0


def get_next_id(collection: Collection, prefix: str, width: int = 3) -> str:
    """
    Generate the next identifier for a collection using a prefix and zero-padded width.
    """
    latest = collection.find({"id": {"$regex": f"^{prefix}"}}).sort("id", -1).limit(1)
    try:
        last_doc = next(latest)
        next_numeric = _parse_id(last_doc["id"], prefix) + 1
    except (StopIteration, KeyError):
        next_numeric = 1
    padded = str(next_numeric).zfill(width)
    return f"{prefix}{padded}"


def timestamp_pair() -> Tuple[str, str]:
    """
    Utility to generate ISO8601 timestamps for createdAt / updatedAt.
    """
    now = datetime.now(timezone.utc).isoformat()
    return now, now


