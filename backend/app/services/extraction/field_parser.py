import re
from typing import Optional, Dict, Any
from app.schemas.scan import LabelDeclaration

class EntityParser:
    """
    Regex and heuristic extraction parser for packaging declarations.
    """
    def parse_text(self, text: str) -> LabelDeclaration:
        decl = LabelDeclaration(raw_ocr_text=text)
        
        # 1. Net Quantity regex
        qty_pattern = r'(?:net\s*qty|net\s*quantity|net\s*content|net\s*wt)[\s.:]*([0-9.]+)\s*(kg|g|gm|ml|l|ltr|litre|liter)'
        qty_match = re.search(qty_pattern, text, re.IGNORECASE)
        if qty_match:
            decl.net_quantity_value = float(qty_match.group(1))
            decl.net_quantity_unit = qty_match.group(2).lower()

        # 2. MRP regex
        mrp_pattern = r'(?:mrp|max\s*retail\s*price)[\s.:]*(?:rs\.?|inr|\u20b9)?\s*([0-9.]+)'
        mrp_match = re.search(mrp_pattern, text, re.IGNORECASE)
        if mrp_match:
            decl.mrp = float(mrp_match.group(1))
            decl.is_mrp_inclusive_of_taxes = bool(re.search(r'incl|inclusive|all\s*taxes', text, re.IGNORECASE))

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
            # else: address stays None (honest — we couldn't parse it)

        # 6. Generic name fallback
        t_low = text.lower()
        if "biscuit" in t_low or "cookie" in t_low:
            decl.generic_name = "Biscuits"
        elif "soap" in t_low:
            decl.generic_name = "Toilet Soap"
        elif "oil" in t_low:
            decl.generic_name = "Edible Refined Oil"

        return decl

entity_parser = EntityParser()
