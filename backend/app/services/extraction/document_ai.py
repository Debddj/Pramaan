from app.schemas.scan import LabelDeclaration
from app.services.extraction.field_parser import entity_parser

class DocumentAIService:
    """
    Multimodal Vision-Language Model interface for structured label extraction.
    """
    def extract_from_image(self, image_bytes: bytes, barcode: str = None) -> LabelDeclaration:
        # Default mock simulation for rapid hackathon testing
        sample_text = """
        BRITANNIA GOOD DAY
        Butter Cookies
        Mfd By: Britannia Industries Ltd, Plot 22, Delhi
        Net Qty: 100 g
        MRP Rs. 30.00 (Incl. of all taxes)
        Mfg Date: 08/26
        Consumer Care: 1800-425-4444, feedback@britannia.co.in
        """
        return entity_parser.parse_text(sample_text)

document_ai = DocumentAIService()
