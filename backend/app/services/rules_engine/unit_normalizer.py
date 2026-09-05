from typing import Tuple, Optional

UNIT_ALIASES = {
    # Weight
    "g": "g", "gm": "g", "gms": "g", "gram": "g", "grams": "g",
    "kg": "kg", "kgs": "kg", "kilogram": "kg", "kilograms": "kg", "kilo": "kg",
    "mg": "mg", "milligram": "mg", "milligrams": "mg",
    # Volume
    "ml": "ml", "mls": "ml", "millilitre": "ml", "milliliter": "ml", "millilitres": "ml", "milliliters": "ml",
    "l": "l", "ltr": "l", "ltrs": "l", "litre": "l", "liter": "l", "litres": "l", "liters": "l",
    "cl": "cl", "centilitre": "cl",
    # Length / Area
    "m": "m", "metre": "m", "meter": "m", "metres": "m", "meters": "m",
    "cm": "cm", "centimetre": "cm", "centimeter": "cm",
    "mm": "mm", "millimetre": "mm", "millimeter": "mm",
    # Count / Numbers
    "n": "N", "u": "U", "unit": "U", "units": "U", "piece": "pcs", "pieces": "pcs", "pcs": "pcs", "no": "N", "number": "N"
}


def normalize_unit(unit: Optional[str]) -> Optional[str]:
    """Standardizes unit strings across extraction and rules."""
    if not unit:
        return None
    cleaned = unit.strip().lower()
    return UNIT_ALIASES.get(cleaned, cleaned)


def normalize_to_base_unit(value: Optional[float], unit: Optional[str]) -> Tuple[Optional[float], Optional[str]]:
    """
    Normalizes mass to grams (g) and volume to millilitres (ml) for consistent comparison.
    """
    if value is None:
        return None, None
    norm_unit = normalize_unit(unit)
    if not norm_unit:
        return value, None

    if norm_unit == "kg":
        return value * 1000.0, "g"
    elif norm_unit == "mg":
        return value / 1000.0, "g"
    elif norm_unit == "l":
        return value * 1000.0, "ml"
    elif norm_unit == "cl":
        return value * 10.0, "ml"
    elif norm_unit == "m":
        return value * 1000.0, "mm"
    elif norm_unit == "cm":
        return value * 10.0, "mm"

    return value, norm_unit
