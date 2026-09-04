import pytest
from app.services.preprocessing.barcode_calibration import calibrator

def test_scale_factor_calculation():
    # If 37.29 mm is represented by 745.8 pixels:
    # 1 pixel = 37.29 / 745.8 = 0.05 mm
    scale = calibrator.compute_scale_factor(745.8)
    assert pytest.approx(scale, 0.001) == 0.05

def test_font_height_measurement():
    scale = 0.05 # mm per pixel
    # Numeral bounding box of 36 pixels:
    # Height = 36 * 0.05 = 1.8 mm
    height_mm = calibrator.measure_height_mm(36.0, scale)
    assert pytest.approx(height_mm, 0.01) == 1.8

def test_pdp_area_calculation():
    scale = 0.05 # mm per pixel
    # Package of 300px by 200px:
    # Height = 15mm, Width = 10mm -> 150 mm^2 -> 1.5 cm^2
    area = calibrator.estimate_pdp_area(300, 200, scale)
    assert pytest.approx(area, 0.01) == 1.5
