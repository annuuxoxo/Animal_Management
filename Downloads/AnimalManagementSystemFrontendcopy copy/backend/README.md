# Animal Management System – Backend

This directory now contains a Flask-based REST API that powers the Animal Management System frontend. The service connects to MongoDB and exposes CRUD endpoints for all facility modules.

## Prerequisites

- Python 3.10+
- MongoDB (local or hosted)

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` when you need to override defaults:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/animal-management
MONGODB_DB_NAME=animal-management
FLASK_ENV=development
```

## Running the Server

```bash
flask --app app run --host 0.0.0.0 --port 5000 --debug
```

The API will be available at `http://localhost:5000`.

## API Overview

- `GET /api/health` – Health check
- `GET|POST|PUT|DELETE /api/animals`
- `GET|POST|PUT|DELETE /api/health-records`
- `GET|POST|PUT|DELETE /api/feeding-tasks`
- `GET|POST|PUT|DELETE /api/breeding-records`
- `GET|POST|PUT|DELETE /api/inventory`
- `GET|POST|PUT|DELETE /api/staff`
- `GET|PUT /api/settings`

## Notes

- IDs are automatically generated with prefixes: animals (`A001`), health records (`H001`), feeding tasks (`F001`), breeding records (`B001`), inventory items (`I001`), staff members (`S001`).
- Inventory status is recalculated whenever quantity or reorder levels change.
- Deleting an animal does **not** cascade deletes in MongoDB; the frontend handles dependent records.


