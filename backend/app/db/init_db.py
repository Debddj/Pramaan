from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.product import Product
from app.core.security import get_password_hash

def init():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Create default inspector if not exists
        if not db.query(User).filter(User.email == "officer@consumer.gov.in").first():
            inspector = User(
                email="officer@consumer.gov.in",
                hashed_password=get_password_hash("sih2026"),
                full_name="Inspector R. Sharma",
                badge_number="DL-LM-4821",
                role="officer"
            )
            db.add(inspector)

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
