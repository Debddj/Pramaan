import io
import numpy as np
from typing import Optional, List
from dataclasses import dataclass


@dataclass
class BarcodeDetectionResult:
    barcode_data: str
    pixel_width: float
    bounding_rect: tuple  # (x, y, width, height)
    is_checksum_valid: bool
    symbology: str = "EAN-13"


def validate_ean13_checksum(barcode: str) -> bool:
    """Validate EAN-13 checksum digit per GS1 spec."""
    if not barcode or len(barcode) != 13 or not barcode.isdigit():
        return False
    digits = [int(d) for d in barcode]
    total = sum(d * (1 if i % 2 == 0 else 3) for i, d in enumerate(digits[:12]))
    check = (10 - (total % 10)) % 10
    return check == digits[12]


class BarcodeDetector:
    """
    Detects barcodes in product images using pyzbar + OpenCV.
    Returns detected barcode data and measured pixel width for
    barcode-as-ruler optical calibration.
    """

    def detect(self, image_bytes: bytes) -> Optional[BarcodeDetectionResult]:
        if not image_bytes:
            return None

        try:
            from PIL import Image
            import cv2
            from pyzbar.pyzbar import decode as pyzbar_decode
        except ImportError:
            return None

        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            cv_image = np.array(pil_image)
            if len(cv_image.shape) == 3 and cv_image.shape[2] == 4:
                cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGBA2RGB)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_RGB2GRAY) if len(cv_image.shape) == 3 else cv_image
        except Exception:
            return None

        try:
            barcodes = pyzbar_decode(gray)
        except Exception:
            return None

        if not barcodes:
            return None

        # Pick the largest barcode (most likely the product barcode)
        best = max(barcodes, key=lambda b: b.rect.width)
        barcode_data = best.data.decode("utf-8", errors="replace")
        rect = best.rect

        return BarcodeDetectionResult(
            barcode_data=barcode_data,
            pixel_width=float(rect.width),
            bounding_rect=(rect.left, rect.top, rect.width, rect.height),
            is_checksum_valid=validate_ean13_checksum(barcode_data),
            symbology=best.type,
        )


barcode_detector = BarcodeDetector()
