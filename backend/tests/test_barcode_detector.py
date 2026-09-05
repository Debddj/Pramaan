import pytest
from app.services.preprocessing.barcode_detector import validate_ean13_checksum, barcode_detector


def test_validate_ean13_checksum():
    # Valid EAN-13 barcode (check digit 3)
    assert validate_ean13_checksum("8901030000003") is True
    # Invalid barcodes
    assert validate_ean13_checksum("8901030000001") is False
    assert validate_ean13_checksum("12345") is False
    assert validate_ean13_checksum("") is False
    assert validate_ean13_checksum("890103000000A") is False


def test_detect_empty_or_invalid():
    assert barcode_detector.detect(b"") is None
    assert barcode_detector.detect(b"not an image") is None
