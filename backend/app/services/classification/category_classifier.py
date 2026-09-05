COMMODITY_KEYWORDS = {
    "biscuits": ["biscuit", "cookie", "rusk", "cookies"],
    "soaps": ["soap", "bathing bar", "toilet soap", "body wash"],
    "edible_oil": ["edible oil", "cooking oil", "mustard oil", "sunflower oil", "soyabean oil", "groundnut oil", "refined oil"],
    "tea": ["tea", "chai", "green tea", "black tea"],
    "coffee": ["coffee", "nescafe", "bru", "espresso"],
    "baby_food": ["baby food", "infant food", "infant milk", "cerelac", "nestum", "lactogen"],
    "bread": ["bread", "loaf", "sliced bread", "bun", "pav"],
    "butter": ["butter", "table butter", "pasteurized butter", "makkhan"],
    "milk_powder": ["milk powder", "dairy whitener", "skimmed milk powder"],
    "detergent": ["detergent", "washing powder", "laundry powder", "surf", "washing bar"],
    "pulses": ["dal", "daal", "pulse", "lentil", "moong", "chana", "urad", "toor", "arhar", "rajma", "chole"],
    "atta": ["atta", "whole wheat flour", "gehun ka atta"],
    "maida": ["maida", "refined wheat flour"],
    "suji": ["suji", "sooji", "semolina", "rava"],
    "rice": ["rice", "basmati", "chawal"],
    "salt": ["salt", "namak", "iodised salt", "rock salt"],
    "spices": ["spice", "masala", "turmeric", "haldi", "chilli powder", "coriander", "dhaniya", "garam masala"],
    "ghee": ["ghee", "clarified butter", "desi ghee"],
    "toothpaste": ["toothpaste", "dantkanti", "colgate", "pepsodent"],
    "hair_oil": ["hair oil", "coconut oil", "amla oil", "almond oil"],
    "cement": ["cement", "portland cement", "opc", "ppc"],
    "paint": ["paint", "emulsion", "distemper", "primer", "enamel"],
    "varnish": ["varnish", "wood finish"],
    "noodles": ["noodles", "instant noodles", "maggi", "pasta", "macaroni", "vermicelli"],
    "aerated_beverage": ["soda", "cola", "pepsi", "coca cola", "aerated water", "carbonated"],
    "mineral_water": ["packaged drinking water", "mineral water", "natural mineral water", "bisleri", "kinley"],
    "fruit_juice": ["juice", "fruit beverage", "nectar", "real juice", "tropicana"],
}


def classify_commodity_category(generic_name: str, brand_name: str = "") -> str:
    text = f"{generic_name or ''} {brand_name or ''}".lower()
    for category, keywords in COMMODITY_KEYWORDS.items():
        if any(k in text for k in keywords):
            return category
    return "general"
