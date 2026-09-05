import pytest
from app.services.rules_engine.unit_normalizer import normalize_unit, normalize_to_base_unit


def test_unit_normalization_aliases():
    assert normalize_unit("g") == "g"
    assert normalize_unit("gm") == "g"
    assert normalize_unit("gms") == "g"
    assert normalize_unit("grams") == "g"
    assert normalize_unit("KG") == "kg"
    assert normalize_unit("Kilograms") == "kg"
    assert normalize_unit("ml") == "ml"
    assert normalize_unit("millilitre") == "ml"
    assert normalize_unit("L") == "l"
    assert normalize_unit("ltr") == "l"
    assert normalize_unit("Litres") == "l"


def test_normalize_to_base_unit_conversion():
    # Mass
    val, unit = normalize_to_base_unit(1.5, "kg")
    assert val == 1500.0
    assert unit == "g"

    val, unit = normalize_to_base_unit(500.0, "g")
    assert val == 500.0
    assert unit == "g"

    # Volume
    val, unit = normalize_to_base_unit(2.0, "l")
    assert val == 2000.0
    assert unit == "ml"

    val, unit = normalize_to_base_unit(750.0, "ml")
    assert val == 750.0
    assert unit == "ml"


def test_none_handling():
    val, unit = normalize_to_base_unit(None, None)
    assert val is None
    assert unit is None
