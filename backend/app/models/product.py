from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True, nullable=False)
    brand_name = Column(String, nullable=False)
    generic_name = Column(String, nullable=False)
    manufacturer = Column(String, nullable=False)
    category = Column(String, nullable=False)  # biscuits, soaps, edible_oil, etc.
    standard_quantity_allowed = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
