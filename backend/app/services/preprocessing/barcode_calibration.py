import numpy as np
from typing import Optional, Tuple, Dict
from app.services.preprocessing.barcode_detector import BarcodeDetectionResult, validate_ean13_checksum

# GS1 EAN-13 nominal standard width: 37.29 mm (inclusive of quiet zones)
GS1_EAN13_NOMINAL_WIDTH_MM = 37.29


class BarcodeCalibrator:
    """
    Optical metrology calibration engine using packaging barcodes as real-world rulers.
    """
    def __init__(self, nominal_width_mm: float = GS1_EAN13_NOMINAL_WIDTH_MM):
        self.nominal_width_mm = nominal_width_mm

    def compute_scale_factor(self, detected_barcode_width_px: float) -> float:
        """
        Scale factor in mm per pixel.
        """
        if detected_barcode_width_px <= 0:
            raise ValueError("Detected barcode pixel width must be > 0")
        return self.nominal_width_mm / detected_barcode_width_px

    def calibrate_from_detection(self, detection: Optional[BarcodeDetectionResult]) -> Optional[float]:
        """
        Computes scale factor directly from a CV detection result if present.
        """
        if not detection or detection.pixel_width <= 0:
            return None
        return self.compute_scale_factor(detection.pixel_width)

    def measure_height_mm(self, text_bbox_height_px: float, scale_factor: float) -> float:
        """
        Converts pixel bounding box height to millimetres.
        """
        return text_bbox_height_px * scale_factor

    def estimate_pdp_area(self, package_height_px: float, package_width_px: float, scale_factor: float) -> float:
        """
        Calculates Principal Display Panel (PDP) surface area in square centimetres.
        """
        height_mm = package_height_px * scale_factor
        width_mm = package_width_px * scale_factor
        return (height_mm * width_mm) / 100.0  # mm^2 to cm^2


calibrator = BarcodeCalibrator()
