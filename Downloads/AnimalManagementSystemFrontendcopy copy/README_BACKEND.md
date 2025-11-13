# Animal Management System – Backend Notes

The backend is implemented entirely with Flask blueprints and PyMongo, matching the REST contract consumed by the React frontend.

## Stack

- Flask + flask-cors
- PyMongo
- MongoDB (same schema and database)
- python-dotenv for environment management

## Key Modules

- `backend/app.py` – Flask application factory and blueprint wiring
- `backend/routes/` – Route blueprints for animals, health records, feeding tasks, breeding records, inventory, staff, and facility settings
- `backend/db.py` – Lazy Mongo client / database accessor
- `backend/utils/id_generator.py` – Sequential ID helper (`A001`, `H001`, etc.)

## Getting Started

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --host 0.0.0.0 --port 5000 --debug
```

The frontend (`src/services/api.ts`) still points to `http://localhost:5000/api`, so no further changes are required client-side.

## Environment Variables

Define these in `backend/.env` if you need to override defaults:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/animal-management
MONGODB_DB_NAME=animal-management
FLASK_ENV=development
```

## Behaviour Parity

- CRUD routes follow the established REST contract used by the frontend.
- Inventory status is recalculated on every create/update based on quantity vs. reorder level.
- Auto-increment style IDs maintain their prefixes (`A`, `H`, `F`, `B`, `I`, `S`).
- Reports page and delete flows rely on the same responses and continue to function with the Flask backend.

## Troubleshooting

- Run `flask --app app run --debug` to see detailed stack traces during development.
- If MongoDB connection fails, confirm `MONGODB_URI` and that the database is reachable.
- Use `flask shell` for quick database checks:

```bash
flask shell
>>> from backend.db import get_db
>>> list(get_db()["animals"].find())
```

## Next Ideas

- Add Pydantic-style request validation
- Introduce logging middleware and structured logs
- Create automated tests for each blueprint

