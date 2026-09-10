import re
from typing import Optional, Dict, Any
from app.schemas.scan import LabelDeclaration
from app.services.classification.category_classifier import COMMODITY_KEYWORDS

class EntityParser:
    """
    Regex and heuristic extraction parser for packaging declarations.
    """
    def parse_text(self, text: str) -> LabelDeclaration:
        decl = LabelDeclaration(raw_ocr_text=text)
        
        # 1. Net Quantity regex
        qty_pattern = r'(?:net\s*qty|net\s*quantity|net\s*content|net\s*wt|quantity)[\s.:]*([0-9.]+)\s*(kg|kgs|g|gm|gms|ml|l|ltr|litre|liter)\b'
        qty_match = re.search(qty_pattern, text, re.IGNORECASE)
        if qty_match:
            try:
                decl.net_quantity_value = float(qty_match.group(1))
                unit = qty_match.group(2).lower()
                if unit in ['gm', 'gms']:
                    unit = 'g'
                elif unit == 'kgs':
                    unit = 'kg'
                elif unit in ['ltr', 'litre', 'liter']:
                    unit = 'l'
                decl.net_quantity_unit = unit
            except (ValueError, TypeError):
                pass

        # 2. MRP regex - handles M.R.P., M. R. P., Maximum Retail Price, etc.
        mrp_pattern = r'(?:m\.?\s*r\.?\s*p\.?|max(?:imum)?\s*retail\s*price|retail\s*price)[\s.:]*(?:rs\.?|inr|\u20b9)?\s*([0-9]+(?:\.[0-9]{1,2})?)'
        mrp_match = re.search(mrp_pattern, text, re.IGNORECASE)
        if mrp_match:
            try:
                decl.mrp = float(mrp_match.group(1))
                decl.is_mrp_inclusive_of_taxes = bool(re.search(r'incl|inclusive|all\s*taxes', text, re.IGNORECASE))
            except (ValueError, TypeError):
                pass

        # 3. Dates
        date_pattern = r'(?:mfg|pkd|packed|date)[\s.:]*([0-9]{2}[/-][0-9]{2,4}|[A-Za-z]{3}\s*[0-9]{2,4})'
        date_match = re.search(date_pattern, text, re.IGNORECASE)
        if date_match:
            decl.mfg_date = date_match.group(1)

        # 4. Consumer care
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        email_match = re.search(email_pattern, text)
        if email_match:
            decl.consumer_care_email = email_match.group(0)

        phone_pattern = r'(?:call|tel|phone|ph|care)[\s.:]*([0-9]{3,5}[-\s]?[0-9]{6,8}|1800[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4})'
        phone_match = re.search(phone_pattern, text, re.IGNORECASE)
        if phone_match:
            decl.consumer_care_phone = phone_match.group(1)

        # 5. Manufacturer / Packer — parse BOTH name AND address from text
        mfg_pattern = r'(?:mfd\s*by|manufactured\s*by|packed\s*by|marketed\s*by)[\s.:]*(.+?)(?:\n|\r|$)'
        mfg_match = re.search(mfg_pattern, text, re.IGNORECASE)
        if mfg_match:
            full_line = mfg_match.group(1).strip()
            # Try to split name and address at the first comma
            parts = full_line.split(',', 1)
            decl.manufacturer_name = parts[0].strip()
            if len(parts) > 1:
                decl.manufacturer_address = parts[1].strip()

        # 6. Generic name fallback via COMMODITY_KEYWORDS across all 27 categories
        CATEGORY_CANONICAL_NAMES = {
            "biscuits": "Biscuits",
            "soaps": "Toilet Soap",
            "edible_oil": "Edible Refined Oil",
            "tea": "Tea",
            "coffee": "Coffee",
            "baby_food": "Baby Food",
            "bread": "Bread",
            "butter": "Butter",
            "milk_powder": "Milk Powder",
            "detergent": "Detergent",
            "pulses": "Pulses",
            "atta": "Atta",
            "maida": "Maida",
            "suji": "Suji",
            "rice": "Rice",
            "salt": "Salt",
            "spices": "Spices",
            "ghee": "Ghee",
            "toothpaste": "Toothpaste",
            "hair_oil": "Hair Oil",
            "cement": "Cement",
            "paint": "Paint",
            "varnish": "Varnish",
            "noodles": "Noodles",
            "aerated_beverage": "Aerated Beverage",
            "mineral_water": "Mineral Water",
            "fruit_juice": "Fruit Juice",
        }

        t_low = text.lower()
        for cat_name, keywords in COMMODITY_KEYWORDS.items():
            for kw in keywords:
                if kw in t_low:
                    decl.generic_name = CATEGORY_CANONICAL_NAMES.get(cat_name, cat_name.replace('_', ' ').title())
                    break
            if decl.generic_name:
                break

        return decl

entity_parser = EntityParser()
