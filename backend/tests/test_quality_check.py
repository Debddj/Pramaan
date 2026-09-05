import pytest
import io
import numpy as np
from PIL import Image
from app.services.preprocessing.quality_check import assess_image_quality, check_image_quality


def _create_test_image(color=(128, 128, 128), size=(100, 100)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_quality_empty_bytes():
    rep = assess_image_quality(b"")
    assert rep.is_acceptable is False
    assert rep.is_blurry is True


def test_quality_uniform_image_detected_as_blurry():
    # Uniform color has 0 laplacian variance -> flagged as blurry
    data = _create_test_image(color=(100, 100, 100))
    rep = assess_image_quality(data)
    assert rep.laplacian_variance < 100.0
    assert rep.is_blurry is True


def test_quality_glare_detection():
    # Saturated white image should flag glare
    data = _create_test_image(color=(255, 255, 255))
    rep = assess_image_quality(data)
    assert rep.has_specular_glare is True
    assert rep.glare_percentage > 5.0
    assert rep.is_acceptable is False
