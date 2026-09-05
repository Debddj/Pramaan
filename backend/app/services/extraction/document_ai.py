from app.schemas.scan import LabelDeclaration
from app.services.extraction.field_parser import entity_parser


class DocumentAIService:
    """
    Multi-tier extraction pipeline:
      1. Gemini 3.5 Flash VLM (if API key configured) — structured extraction
      2. PaddleOCR (bilingual offline OCR) + regex field parser
      3. Offline Tesseract OCR + regex field parser
      4. Empty LabelDeclaration if no image provided
    """

    def extract_from_image(self, image_bytes: bytes, barcode: str = None) -> LabelDeclaration:
        if not image_bytes:
            return LabelDeclaration()

        # Tier 1: Gemini 3.5 Flash VLM (if available)
        try:
            from app.services.extraction.gemini_vlm import gemini_extractor
            if gemini_extractor.is_available():
                result = gemini_extractor.extract(image_bytes)
                if result is not None:
                    return result
        except Exception:
            pass  # Fall through to OCR

        # Tier 2: PaddleOCR + regex parser
        try:
            from app.services.extraction.paddle_ocr import paddle_ocr
            if paddle_ocr.is_available():
                p_text = paddle_ocr.ocr(image_bytes)
                if p_text and p_text.strip():
                    return entity_parser.parse_text(p_text)
        except Exception:
            pass

        # Tier 3: Offline Tesseract OCR + regex parser
        try:
            from app.services.extraction.ocr_fallback import ocr_fallback
            ocr_text = ocr_fallback.ocr(image_bytes)
            if ocr_text and ocr_text.strip():
                return entity_parser.parse_text(ocr_text)
        except Exception:
            pass

        # Tier 4: Nothing worked
        return LabelDeclaration(
            raw_ocr_text=f"[Extraction failed; received {len(image_bytes)} bytes]"
        )


document_ai = DocumentAIService()
