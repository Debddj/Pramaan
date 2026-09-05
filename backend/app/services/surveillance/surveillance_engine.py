from datetime import datetime
from typing import Optional, List
from app.schemas.surveillance import ListingItem, SurveillanceScanResponse
from app.services.extraction.field_parser import entity_parser
from app.services.rules_engine.engine import engine_instance
from app.services.classification.category_classifier import classify_commodity_category


class SurveillanceEngine:
    def scan_listing_item(self, item: ListingItem) -> SurveillanceScanResponse:
        decl = entity_parser.parse_text(item.sample_ocr_text)
        category = item.category or classify_commodity_category(decl.generic_name or item.title)

        status, violations = engine_instance.evaluate(
            decl=decl,
            category=category,
        )

        expected = 7
        actual_fields = sum(
            1 for v in [
                decl.manufacturer_name,
                decl.generic_name,
                decl.net_quantity_value,
                decl.mfg_date,
                decl.mrp,
                decl.is_mrp_inclusive_of_taxes,
                decl.consumer_care_email or decl.consumer_care_phone,
            ]
            if v
        )
        compliance_score = round(max(0.0, (actual_fields - len(violations)) / expected), 2)

        return SurveillanceScanResponse(
            listing_url=item.listing_url,
            marketplace=item.marketplace,
            product_title=item.title,
            status=status,
            violations=violations,
            compliance_score=compliance_score,
            scanned_at=datetime.utcnow(),
        )


surveillance_engine = SurveillanceEngine()
