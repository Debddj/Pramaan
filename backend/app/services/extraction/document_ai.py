from app.schemas.scan import LabelDeclaration
from app.services.extraction.field_parser import entity_parser

class DocumentAIService:
    """
    Multimodal Vision-Language Model interface for structured label extraction.
    When a real VLM backend (e.g. Gemini, PaLM Vision) is configured, this
    class delegates to it.  Otherwise it falls back to offline OCR + regex parsing.
    """

    def extract_from_image(self, image_bytes: bytes, barcode: str = None) -> LabelDeclaration:
        if not image_bytes:
            # No image provided — return empty declaration (no fake data)
            return LabelDeclaration()

        # Attempt offline OCR on the actual image bytes
        try:
            from app.services.extraction.ocr_fallback import ocr_fallback
            ocr_text = ocr_fallback.ocr(image_bytes)
        except RuntimeError:
            # OCR engine not available — return empty with just the raw bytes length noted
            return LabelDeclaration(
                raw_ocr_text=f"[OCR unavailable; received {len(image_bytes)} bytes]"
            )

        if not ocr_text or not ocr_text.strip():
            return LabelDeclaration(raw_ocr_text="[OCR returned empty text]")

        # Parse the actual OCR output into structured fields
        return entity_parser.parse_text(ocr_text)


document_ai = DocumentAIService()
