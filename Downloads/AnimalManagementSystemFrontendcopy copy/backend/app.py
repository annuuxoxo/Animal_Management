import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from .routes.animals import animals_bp
from .routes.breeding_records import breeding_bp
from .routes.feeding_tasks import feeding_bp
from .routes.health_records import health_bp
from .routes.inventory import inventory_bp
from .routes.settings import settings_bp
from .routes.staff import staff_bp


def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    # Register blueprints
    app.register_blueprint(animals_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(feeding_bp)
    app.register_blueprint(breeding_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(settings_bp)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "OK", "message": "Server is running"})

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") != "production")


