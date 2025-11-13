import os
from functools import lru_cache
from typing import Optional

from pymongo import MongoClient


def _get_database_from_uri(uri: str, fallback: Optional[str] = None):
    """
    Return the database object defined in the Mongo URI or use the fallback name.
    pymongo.MongoClient automatically selects the database if one is included in the URI path.
    """
    client = MongoClient(uri)

    # When a database is provided in the URI, get_default_database returns it.
    db = client.get_default_database()
    if db is not None:
        return db

    # Otherwise, fall back to a provided name or default.
    db_name = fallback or "animal-management"
    return client[db_name]


@lru_cache(maxsize=1)
def get_db():
    """
    Cached accessor for the Mongo database connection.
    """
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/animal-management")
    fallback_db = os.getenv("MONGODB_DB_NAME", "animal-management")
    return _get_database_from_uri(mongo_uri, fallback_db)


