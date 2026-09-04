# Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 7(2) Tables

def lookup_table_1_min_height(quantity_value: float, unit: str) -> float:
    """
    Rule 7(2), Table I: Minimum height of numerals and letters based on Net Quantity
    (For weight in g/kg or volume in ml/L). Returns height in mm.
    """
    u = unit.lower().strip()
    # Normalize to grams or ml
    normalized_val = quantity_value
    if u in ['kg', 'l', 'litre', 'liter', 'kilogram']:
        normalized_val = quantity_value * 1000.0
    
    if normalized_val <= 50.0:
        return 1.0
    elif normalized_val <= 200.0:
        return 2.0
    elif normalized_val <= 1000.0:
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

# Second Schedule (Rule 5) Permitted Standard Sizes (in grams/ml)
SECOND_SCHEDULE_STANDARDS = {
    "baby_food": [100, 200, 400, 500, 1000],
    "biscuits": [25, 50, 75, 100, 150, 200, 250, 300],  # Above 300g in multiples of 100g
    "bread": [100, 200, 400, 800],
    "butter": [25, 50, 100, 200, 500],
    "tea": [25, 50, 100, 250, 500, 1000],
    "edible_oil": [50, 100, 200, 500, 1000, 2000, 3000, 5000],
    "milk_powder": [100, 200, 500, 1000],
    "soaps": [25, 50, 75, 100, 125, 150],  # Above 150g in multiples of 50g
    "detergent": [50, 100, 200, 500, 1000, 2000, 3000, 5000],
    "pulses": [100, 200, 500, 1000, 2000, 5000]
}

def is_second_schedule_standard_size(category: str, quantity_value: float, unit: str) -> bool:
    cat = category.lower().strip()
    if cat not in SECOND_SCHEDULE_STANDARDS:
        return True # Not a strictly scheduled commodity
    
    u = unit.lower().strip()
    val = quantity_value
    if u in ['kg', 'l']:
        val = quantity_value * 1000.0
        
    allowed_list = SECOND_SCHEDULE_STANDARDS[cat]
    
    if val in allowed_list:
        return True
    
    # Handle multiples rules
    if cat == "biscuits" and val > 300 and val % 100 == 0:
        return True
    if cat == "soaps" and val > 150 and val % 50 == 0:
        return True
    if cat in ["edible_oil", "detergent", "pulses"] and val > 5000 and val % 1000 == 0:
        return True
        
    return False
