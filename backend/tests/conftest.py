import pytest
from app.schemas.scan import LabelDeclaration

@pytest.fixture
def compliant_declaration():
    return LabelDeclaration(
        manufacturer_name="Britannia Industries Ltd",
        manufacturer_address="5/1A Hungerford Street, Kolkata",
        generic_name="Biscuits",
        net_quantity_value=100.0,
        net_quantity_unit="g",
        mfg_date="08/2026",
        mrp=30.0,
        is_mrp_inclusive_of_taxes=True,
        consumer_care_email="feedback@britannia.co.in",
        consumer_care_phone="1800-425-4444"
    )
