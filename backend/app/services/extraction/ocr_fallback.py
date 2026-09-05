import io


class OfflineOCRFallback:
    """
    Local bilingual (Devanagari/English) OCR fallback using Tesseract.
    Falls back to a RuntimeError if Tesseract is not installed, instead of
    silently returning hardcoded text.
    """

    @staticmethod
    def is_available() -> bool:
        """Check whether the OCR engine (pytesseract + Tesseract binary) is installed."""
        try:
            import pytesseract
            # Quick sanity check — will raise if tesseract binary is missing
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def ocr(self, image_bytes: bytes) -> str:
        """
        Run OCR on raw image bytes and return the extracted text.
        Raises RuntimeError if Tesseract is not available.
        """
        if not image_bytes:
            return ""

        try:
            import pytesseract
            from PIL import Image
        except ImportError:
            raise RuntimeError(
                "pytesseract and/or Pillow not installed. "
                "Install with: pip install pytesseract Pillow"
            )

        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as exc:
            raise RuntimeError(f"Cannot decode image bytes: {exc}") from exc

        try:
            # Use English + Hindi (Devanagari) if available
            text = pytesseract.image_to_string(image, lang="eng+hin")
        except pytesseract.TesseractNotFoundError:
            raise RuntimeError(
                "Tesseract binary not found. Install Tesseract-OCR and ensure it is on PATH."
            )
        except Exception:
            # Fallback to English only
            text = pytesseract.image_to_string(image, lang="eng")

        return text.strip()


ocr_fallback = OfflineOCRFallback()
