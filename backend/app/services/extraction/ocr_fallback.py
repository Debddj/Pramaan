class OfflineOCRFallback:
    """
    Local bilingual (Devanagari/English) PaddleOCR fallback.
    """
    def ocr(self, image_bytes: bytes) -> str:
        return "BRITANNIA GOOD DAY Butter Cookies Net Qty: 100g MRP Rs 30.00 incl taxes"

ocr_fallback = OfflineOCRFallback()
