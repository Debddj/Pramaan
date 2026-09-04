from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    barcode: str
    brand_name: str
    generic_name: str
    manufacturer: str
    category: str
    standard_quantity_allowed: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True
