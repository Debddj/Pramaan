# Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 7(2) Tables & Second Schedule
from typing import Dict, List, Optional
from app.services.rules_engine.unit_normalizer import normalize_to_base_unit, normalize_unit


def lookup_table_1_min_height(quantity_value: float, unit: str) -> float:
    """
    Rule 7(2), Table I: Minimum height of numerals and letters based on Net Quantity.
    Returns required height in mm.
    """
    base_val, base_unit = normalize_to_base_unit(quantity_value, unit)
    if base_val is None:
        return 1.0

    if base_val <= 50.0:
        return 1.0
    elif base_val <= 200.0:
        return 2.0
    elif base_val <= 1000.0:
        return 4.0
    else:
        return 6.0


def lookup_table_2_min_height(pdp_area_sq_cm: float, is_embossed: bool = False) -> float:
    """
    Rule 7(2), Table II: Minimum height of numerals and letters based on PDP Area.
    Heights roughly double for blown, moulded, or embossed surfaces.
    """
    if pdp_area_sq_cm <= 50.0:
        base = 1.0
    elif pdp_area_sq_cm <= 100.0:
        base = 1.5
    elif pdp_area_sq_cm <= 500.0:
        base = 2.0
    else:
        base = 4.0

    return base * 2.0 if is_embossed else base


# Second Schedule (Rule 5) Permitted Standard Sizes (in grams or millilitres)
# Source: Legal Metrology (Packaged Commodities) Rules, 2011, Second Schedule
SECOND_SCHEDULE_STANDARDS: Dict[str, List[float]] = {
    "baby_food": [100.0, 200.0, 400.0, 500.0, 1000.0],
    "biscuits": [25.0, 50.0, 75.0, 100.0, 150.0, 200.0, 250.0, 300.0],
    "bread": [100.0, 200.0, 400.0, 800.0],
    "butter": [25.0, 50.0, 100.0, 200.0, 500.0],
    "tea": [25.0, 50.0, 100.0, 250.0, 500.0, 1000.0],
    "coffee": [25.0, 50.0, 100.0, 200.0, 500.0, 1000.0],
    "edible_oil": [50.0, 100.0, 200.0, 500.0, 1000.0, 2000.0, 3000.0, 5000.0],
    "milk_powder": [100.0, 200.0, 500.0, 1000.0],
    "soaps": [25.0, 50.0, 75.0, 100.0, 125.0, 150.0],
    "detergent": [50.0, 100.0, 200.0, 500.0, 1000.0, 2000.0, 3000.0, 5000.0],
    "pulses": [100.0, 200.0, 500.0, 1000.0, 2000.0, 5000.0],
    "atta": [500.0, 1000.0, 2000.0, 5000.0, 10000.0],
    "maida": [500.0, 1000.0, 2000.0, 5000.0],
    "suji": [500.0, 1000.0, 2000.0, 5000.0],
    "rice": [1000.0, 2000.0, 5000.0, 10000.0, 25000.0],
    "salt": [100.0, 200.0, 500.0, 1000.0],
    "spices": [25.0, 50.0, 100.0, 200.0, 500.0, 1000.0],
    "ghee": [50.0, 100.0, 200.0, 500.0, 1000.0, 2000.0, 5000.0],
    "toothpaste": [25.0, 50.0, 100.0, 150.0, 200.0],
    "hair_oil": [25.0, 50.0, 100.0, 200.0, 500.0, 1000.0],
    "cement": [1000.0, 5000.0, 25000.0, 50000.0],
    "paint": [50.0, 100.0, 200.0, 500.0, 1000.0, 2000.0, 4000.0, 10000.0, 20000.0],
    "varnish": [50.0, 100.0, 200.0, 500.0, 1000.0, 2000.0, 4000.0],
    "noodles": [50.0, 70.0, 100.0, 140.0, 280.0, 500.0],
    "aerated_beverage": [150.0, 200.0, 250.0, 300.0, 330.0, 500.0, 600.0, 750.0, 1000.0, 1250.0, 1500.0, 2000.0],
    "mineral_water": [200.0, 250.0, 500.0, 750.0, 1000.0, 1500.0, 2000.0, 5000.0],
    "fruit_juice": [100.0, 200.0, 250.0, 500.0, 1000.0, 1500.0, 2000.0],
}


def is_second_schedule_standard_size(category: str, quantity_value: float, unit: str) -> bool:
    cat = category.lower().strip().replace(" ", "_").replace("-", "_")
    if cat not in SECOND_SCHEDULE_STANDARDS:
        return True  # Not a strictly scheduled commodity

    base_val, _ = normalize_to_base_unit(quantity_value, unit)
    if base_val is None:
        return True

    allowed_list = SECOND_SCHEDULE_STANDARDS[cat]
    if base_val in allowed_list:
        return True

    # Multiples rules
    if cat == "biscuits" and base_val > 300 and base_val % 100 == 0:
        return True
    if cat == "soaps" and base_val > 150 and base_val % 50 == 0:
        return True
    if cat in ["edible_oil", "detergent", "pulses", "atta", "rice", "ghee"] and base_val >= 5000 and base_val % 1000 == 0:
        return True
    if cat in ["paint", "varnish"] and base_val > 4000 and base_val % 1000 == 0:
        return True

    return False
