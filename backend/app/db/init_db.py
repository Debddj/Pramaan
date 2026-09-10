from sqlalchemy import text
from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.product import Product
from app.core.security import get_password_hash

import os

DEFAULT_OFFICER_EMAIL = os.getenv("DEFAULT_OFFICER_EMAIL", "officer@consumer.gov.in")
DEFAULT_OFFICER_PASSWORD = os.getenv("DEFAULT_OFFICER_PASSWORD", "sih2026")
DEFAULT_OFFICER_NAME = os.getenv("DEFAULT_OFFICER_NAME", "Inspector R. Sharma")
DEFAULT_OFFICER_BADGE = os.getenv("DEFAULT_OFFICER_BADGE", "DL-LM-4821")

def init():
    Base.metadata.create_all(bind=engine)

    # Schema migration for existing SQLite DBs
    try:
        with engine.connect() as conn:
            if "sqlite" in str(engine.url):
                res = conn.execute(text("PRAGMA table_info(scans)"))
                cols = [r[1] for r in res.fetchall()]
                if cols and "image_data_base64" not in cols:
                    conn.execute(text("ALTER TABLE scans ADD COLUMN image_data_base64 TEXT"))
                    conn.commit()
    except Exception as e:
        print("Schema migration notice:", e)

    db = SessionLocal()
    
    try:
        # Create default inspector if not exists, or refresh hash to valid bcrypt
        existing_officer = db.query(User).filter(User.email == DEFAULT_OFFICER_EMAIL).first()
        if not existing_officer:
            inspector = User(
                email=DEFAULT_OFFICER_EMAIL,
                hashed_password=get_password_hash(DEFAULT_OFFICER_PASSWORD),
                full_name=DEFAULT_OFFICER_NAME,
                badge_number=DEFAULT_OFFICER_BADGE,
                role="officer"
            )
            db.add(inspector)
        else:
            existing_officer.hashed_password = get_password_hash(DEFAULT_OFFICER_PASSWORD)

        # Seed demo products
        sample_products = [
            Product(barcode="8901030000001", brand_name="Good Day", generic_name="Butter Cookies", manufacturer="Britannia Ltd", category="biscuits", standard_quantity_allowed="100g"),
            Product(barcode="8901030000002", brand_name="Lux Soft Touch", generic_name="Toilet Soap", manufacturer="Hindustan Unilever Ltd", category="soaps", standard_quantity_allowed="100g"),
            Product(barcode="8901030000003", brand_name="Fortune Plus", generic_name="Refined Sunflower Oil", manufacturer="Adani Wilmar Ltd", category="edible_oil", standard_quantity_allowed="1L")
        ]
        for p in sample_products:
            if not db.query(Product).filter(Product.barcode == p.barcode).first():
                db.add(p)
                
        db.commit()
    finally:
        db.close()
    print("Database tables & initial seed data initialized successfully.")

if __name__ == "__main__":
    init()
