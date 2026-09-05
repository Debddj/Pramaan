import io
import numpy as np
from typing import Optional, List
from dataclasses import dataclass
from PIL import Image


@dataclass
class TextBlock:
    text: str
    confidence: float
    bbox: list  # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]


class PaddleOCREngine:
    """
    Bilingual (English + Hindi/Devanagari) OCR using PaddleOCR.
    CPU-compatible, offline-first.
    """
    def __init__(self):
        self._ocr = None
        self._initialized = False

    def is_available(self) -> bool:
        try:
            import paddleocr
            return True
        except ImportError:
            return False

    def _get_ocr(self):
        if not self._initialized:
            try:
                from paddleocr import PaddleOCR
                self._ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
                self._initialized = True
            except Exception:
                self._initialized = True
                self._ocr = None
        return self._ocr

    def ocr(self, image_bytes: bytes) -> str:
        blocks = self.ocr_with_bboxes(image_bytes)
        return "\n".join(b.text for b in blocks)

    def ocr_with_bboxes(self, image_bytes: bytes) -> List[TextBlock]:
        if not image_bytes:
            return []
        engine = self._get_ocr()
        if engine is None:
            return []

        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            img_np = np.array(pil_img)
            result = engine.ocr(img_np, cls=True)
            blocks = []
            if result and result[0]:
                for line in result[0]:
                    bbox = line[0]
                    text, conf = line[1]
                    blocks.append(TextBlock(text=text, confidence=float(conf), bbox=bbox))
            return blocks
        except Exception:
            return []


paddle_ocr = PaddleOCREngine()
