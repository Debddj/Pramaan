import difflib
import re

COMMODITY_KEYWORDS = {
    "biscuits": ["biscuit", "cookie", "rusk", "cookies", "बिस्कुट", "बिस्किट", "कुकीज़"],
    "soaps": ["soap", "bathing bar", "toilet soap", "body wash", "साबुन"],
    "edible_oil": ["edible oil", "cooking oil", "mustard oil", "sunflower oil", "soyabean oil", "groundnut oil", "refined oil", "तेल", "खाद्य तेल", "सरसों का तेल"],
    "tea": ["tea", "chai", "green tea", "black tea", "चाय"],
    "coffee": ["coffee", "nescafe", "bru", "espresso", "कॉफ़ी", "कॉफी"],
    "baby_food": ["baby food", "infant food", "infant milk", "cerelac", "nestum", "lactogen", "शिशु आहार", "बेबी फूड"],
    "bread": ["bread", "loaf", "sliced bread", "bun", "pav", "ब्रेड", "पाव"],
    "butter": ["butter", "table butter", "pasteurized butter", "makkhan", "मक्खन"],
    "milk_powder": ["milk powder", "dairy whitener", "skimmed milk powder", "दूध पाउडर"],
    "detergent": ["detergent", "washing powder", "laundry powder", "surf", "washing bar", "डिटर्जेंट", "सर्फ़"],
    "pulses": ["dal", "daal", "pulse", "lentil", "moong", "chana", "urad", "toor", "arhar", "rajma", "chole", "दाल", "चना", "मूंग", "उड़द", "राजमा"],
    "atta": ["atta", "whole wheat flour", "gehun ka atta", "आटा", "गेहूं का आटा"],
    "maida": ["maida", "refined wheat flour", "मैदा"],
    "suji": ["suji", "sooji", "semolina", "rava", "सूजी", "रवा"],
    "rice": ["rice", "basmati", "chawal", "चावल", "बासमती"],
    "salt": ["salt", "namak", "iodised salt", "rock salt", "नमक"],
    "spices": ["spice", "masala", "turmeric", "haldi", "chilli powder", "coriander", "dhaniya", "garam masala", "मसाला", "हल्दी", "धनिया", "मिर्च"],
    "ghee": ["ghee", "clarified butter", "desi ghee", "घी", "देसी घी"],
    "toothpaste": ["toothpaste", "dantkanti", "colgate", "pepsodent", "टूथपेस्ट", "दंत मंजन"],
    "hair_oil": ["hair oil", "coconut oil", "amla oil", "almond oil", "बालों का तेल"],
    "cement": ["cement", "portland cement", "opc", "ppc", "सीमेंट"],
    "paint": ["paint", "emulsion", "distemper", "primer", "enamel", "पेंट"],
    "varnish": ["varnish", "wood finish", "वार्निश"],
    "noodles": ["noodles", "instant noodles", "maggi", "pasta", "macaroni", "vermicelli", "नूडल्स", "मैगी", "पास्ता"],
    "aerated_beverage": ["soda", "cola", "pepsi", "coca cola", "aerated water", "carbonated", "शीतल पेय", "सोडा"],
    "mineral_water": ["packaged drinking water", "mineral water", "natural mineral water", "bisleri", "kinley", "पेयजल", "मिनरल वाटर"],
    "fruit_juice": ["juice", "fruit beverage", "nectar", "real juice", "tropicana", "जूस", "रस", "फलों का रस"],
}


def _fuzzy_token_match(word: str, target: str, min_ratio: float = 0.82) -> bool:
    """Matches words under minor OCR character mutations/typos using sequence similarity."""
    if len(word) < 4 or len(target) < 4:
        return False
    if abs(len(word) - len(target)) > 2:
        return False
    return difflib.SequenceMatcher(None, word, target).ratio() >= min_ratio


def classify_commodity_category(generic_name: str, brand_name: str = "") -> str:
    """
    Classifies packaging text into one of the 27 Second Schedule statutory categories.
    Supports English keywords, Hindi/regional terms, and Levenshtein fuzzy matching for OCR tolerance.
    """
    raw_text = f"{generic_name or ''} {brand_name or ''}".lower()
    if not raw_text.strip():
        return "general"

    # 1. Exact phrase/substring match (high precision)
    for category, keywords in COMMODITY_KEYWORDS.items():
        if any(k in raw_text for k in keywords):
            return category

    # 2. Tokenized fuzzy matching (handles OCR typos like 'biscut', 'toothpast', 'detergnt')
    tokens = [w for w in re.findall(r'[\w]+', raw_text) if len(w) >= 4]
    for category, keywords in COMMODITY_KEYWORDS.items():
        for kw in keywords:
            if ' ' not in kw:  # single-word keywords only for token match
                for token in tokens:
                    if _fuzzy_token_match(token, kw):
                        return category

    return "general"

