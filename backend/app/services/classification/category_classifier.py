def classify_commodity_category(generic_name: str, brand_name: str = "") -> str:
    text = f"{generic_name} {brand_name}".lower()
    if any(k in text for k in ["biscuit", "cookie", "rusk"]):
        return "biscuits"
    if any(k in text for k in ["soap", "bathing bar", "toilet soap"]):
        return "soaps"
    if any(k in text for k in ["oil", "ghee", "mustard oil", "sunflower"]):
        return "edible_oil"
    if any(k in text for k in ["tea", "chai"]):
        return "tea"
    if any(k in text for k in ["baby", "infant", "cerelac"]):
        return "baby_food"
    return "general"
