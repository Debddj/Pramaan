import json
import base64
from typing import Optional
from app.schemas.scan import LabelDeclaration
from app.core.config import settings


class GeminiVLMExtractor:
    """
    Structured label extraction using Google Gemini 3.5 Flash Vision API.
    Sends the product image with a carefully engineered prompt to extract
    all LMPC-required declaration fields as structured JSON.
    """

    EXTRACTION_PROMPT = '''You are an expert Indian Legal Metrology inspector.
Analyze this product packaging label image and extract ALL of the following fields.
Return ONLY valid JSON with these exact keys (use null for fields you cannot find):

{
  "manufacturer_name": "string or null",
  "manufacturer_address": "string or null",
  "generic_name": "string or null — the common/generic commodity name like Biscuits, Toilet Soap, etc.",
  "net_quantity_value": "number or null — just the numeric value",
  "net_quantity_unit": "string or null — g, kg, ml, l, etc.",
  "mfg_date": "string or null — manufacturing or packing date",
  "expiry_date": "string or null",
  "mrp": "number or null — Maximum Retail Price numeric value",
  "is_mrp_inclusive_of_taxes": "boolean — true if label says 'inclusive of all taxes' or similar",
  "consumer_care_email": "string or null",
  "consumer_care_phone": "string or null",
  "consumer_care_address": "string or null",
  "country_of_origin": "string or null",
  "raw_ocr_text": "string — full text visible on the label"
}

Be thorough. Extract text in both English and Hindi/Devanagari if present.'''

    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return self._client

    @staticmethod
    def is_available() -> bool:
        """Check if Gemini API key is configured."""
        return bool(settings.GEMINI_API_KEY)

    def extract(self, image_bytes: bytes) -> Optional[LabelDeclaration]:
        """
        Send image to Gemini 3.5 Flash for structured field extraction.
        Returns LabelDeclaration on success, None on failure.
        """
        if not self.is_available() or not image_bytes:
            return None

        try:
            from google import genai
            from google.genai import types

            client = self._get_client()

            # Build image part
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type="image/jpeg",
            )

            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=[self.EXTRACTION_PROMPT, image_part],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=2048,
                ),
            )

            # Parse JSON from response
            text = response.text.strip()
            # Handle markdown code fences
            if text.startswith("`"):
                text = text.split("\n", 1)[1]
                if text.endswith("`"):
                    text = text[:-3]
                text = text.strip()

            data = json.loads(text)

            return LabelDeclaration(
                manufacturer_name=data.get("manufacturer_name"),
                manufacturer_address=data.get("manufacturer_address"),
                generic_name=data.get("generic_name"),
                net_quantity_value=float(data["net_quantity_value"]) if data.get("net_quantity_value") is not None else None,
                net_quantity_unit=data.get("net_quantity_unit"),
                mfg_date=data.get("mfg_date"),
                expiry_date=data.get("expiry_date"),
                mrp=float(data["mrp"]) if data.get("mrp") is not None else None,
                is_mrp_inclusive_of_taxes=data.get("is_mrp_inclusive_of_taxes", False),
                consumer_care_email=data.get("consumer_care_email"),
                consumer_care_phone=data.get("consumer_care_phone"),
                consumer_care_address=data.get("consumer_care_address"),
                country_of_origin=data.get("country_of_origin"),
                raw_ocr_text=data.get("raw_ocr_text", ""),
            )

        except Exception as e:
            # Log and fall through to OCR fallback
            import structlog
            logger = structlog.get_logger()
            logger.warning("gemini_vlm_extraction_failed", error=str(e))
            return None


gemini_extractor = GeminiVLMExtractor()
