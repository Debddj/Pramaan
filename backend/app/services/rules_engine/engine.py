import json
import os
from typing import List, Dict, Any, Tuple
from app.schemas.scan import LabelDeclaration, ViolationOut
from app.services.rules_engine.lookup_tables import (
    lookup_table_1_min_height,
    lookup_table_2_min_height,
    is_second_schedule_standard_size
)

class RulesEngine:
    def __init__(self, rules_dir: str = None):
        if not rules_dir:
            rules_dir = os.path.join(os.path.dirname(__file__), "rules")
        self.rules_dir = rules_dir

    def evaluate(
        self,
        decl: LabelDeclaration,
        measured_height_mm: float = None,
        pdp_area_sq_cm: float = None,
        category: str = "general",
        contrast_ratio: float = 4.5,
        is_embossed: bool = False
    ) -> Tuple[str, List[ViolationOut]]:
        """
        Evaluates extracted packaging declarations against LMPC statutory rules.
        Returns: (status: 'compliant' | 'violation' | 'exempt', violations: List[ViolationOut])
        """
        violations: List[ViolationOut] = []

        # 1. Rule 26 Exemption Check (<= 10g / 10ml)
        if decl.net_quantity_value is not None and decl.net_quantity_unit:
            u = decl.net_quantity_unit.lower()
            val = decl.net_quantity_value
            is_small = (u in ['g', 'ml'] and val <= 10.0)
            if is_small:
                return "exempt", []

        # 2. Rule 6(1) Mandatory Declarations
        if not decl.manufacturer_name or not decl.manufacturer_address:
            violations.append(ViolationOut(
                rule_id="LMPC-R6-1-A",
                citation="Rule 6(1)(a)",
                severity="critical",
                measured_value="Missing/Incomplete",
                required_value="Name and complete physical address",
                violation_text="Manufacturer or Packer name and complete address is missing under Rule 6(1)(a)"
            ))

        if not decl.generic_name:
            violations.append(ViolationOut(
                rule_id="LMPC-R6-1-B",
                citation="Rule 6(1)(b)",
                severity="critical",
                measured_value="Missing",
                required_value="Generic or common name",
                violation_text="Generic or common commodity name is omitted under Rule 6(1)(b)"
            ))

        if decl.net_quantity_value is None or not decl.net_quantity_unit:
            violations.append(ViolationOut(
                rule_id="LMPC-R6-1-C",
                citation="Rule 6(1)(c)",
                severity="critical",
                measured_value="Missing",
                required_value="Net quantity declaration with metric unit",
                violation_text="Net quantity declaration is missing or incomplete under Rule 6(1)(c)"
            ))

        if not decl.mfg_date:
            violations.append(ViolationOut(
                rule_id="LMPC-R6-1-D",
                citation="Rule 6(1)(d)",
                severity="critical",
                measured_value="Missing",
                required_value="Month & Year of Packing/Mfg",
                violation_text="Month and year of manufacture/packing is missing under Rule 6(1)(d)"
            ))

        if decl.mrp is None or not decl.is_mrp_inclusive_of_taxes:
            violations.append(ViolationOut(
                rule_id="LMPC-R6-1-E",
                citation="Rule 6(1)(e)",
                severity="critical",
                measured_value=f"MRP: {decl.mrp} (Tax Inclusive: {decl.is_mrp_inclusive_of_taxes})",
                required_value="MRP 'inclusive of all taxes'",
                violation_text="Retail sale price (MRP) does not state 'inclusive of all taxes' or is missing under Rule 6(1)(e)"
            ))

        # Rule 6(2) Consumer Care
        if not decl.consumer_care_email and not decl.consumer_care_phone:
            violations.append(ViolationOut(
                rule_id="LMPC-R6-2-CARE",
                citation="Rule 6(2)",
                severity="critical",
                measured_value="None detected",
                required_value="Consumer grievance phone, email, and address",
                violation_text="Consumer care phone and email contact are completely omitted under Rule 6(2)"
            ))

        # 3. Rule 7(2) Minimum Numeral Height Check (Optical Metrology)
        if measured_height_mm is not None and decl.net_quantity_value is not None and decl.net_quantity_unit:
            req_t1 = lookup_table_1_min_height(decl.net_quantity_value, decl.net_quantity_unit)
            if measured_height_mm < req_t1:
                violations.append(ViolationOut(
                    rule_id="LMPC-R7-TABLE-1",
                    citation="Rule 7(2), Table I",
                    severity="critical",
                    measured_value=f"{measured_height_mm:.2f} mm",
                    required_value=f"{req_t1:.2f} mm",
                    violation_text=f"Measured numeral height {measured_height_mm:.2f}mm is below statutory minimum {req_t1:.2f}mm required for a {decl.net_quantity_value}{decl.net_quantity_unit} package under Rule 7(2), Table I"
                ))

            if pdp_area_sq_cm is not None:
                req_t2 = lookup_table_2_min_height(pdp_area_sq_cm, is_embossed)
                if measured_height_mm < req_t2:
                    violations.append(ViolationOut(
                        rule_id="LMPC-R7-TABLE-2",
                        citation="Rule 7(2), Table II",
                        severity="critical",
                        measured_value=f"{measured_height_mm:.2f} mm",
                        required_value=f"{req_t2:.2f} mm",
                        violation_text=f"Measured numeral height {measured_height_mm:.2f}mm is below statutory minimum {req_t2:.2f}mm required for PDP area {pdp_area_sq_cm:.1f} sq cm under Rule 7(2), Table II"
                    ))

        # 4. Second Schedule Pack Size Enforcement
        if decl.net_quantity_value is not None and decl.net_quantity_unit and category != "general":
            is_std = is_second_schedule_standard_size(category, decl.net_quantity_value, decl.net_quantity_unit)
            # Check if exception declared
            has_exception = "not a standard pack size" in (decl.raw_ocr_text or "").lower()
            if not is_std and not has_exception:
                violations.append(ViolationOut(
                    rule_id="LMPC-R5-SECOND-SCHEDULE",
                    citation="Rule 5, Second Schedule",
                    severity="moderate",
                    measured_value=f"{decl.net_quantity_value} {decl.net_quantity_unit}",
                    required_value="Prescribed Standard Pack Size",
                    violation_text=f"Declared quantity {decl.net_quantity_value}{decl.net_quantity_unit} is not an approved standard pack size for {category} under the Second Schedule, and lacks mandatory 'Not a standard pack size' declaration"
                ))

        # 5. Rule 9(1)(b) Color Contrast Check
        if contrast_ratio is not None and contrast_ratio < 3.0:
            violations.append(ViolationOut(
                rule_id="LMPC-R9-CONTRAST",
                citation="Rule 9(1)(b)",
                severity="moderate",
                measured_value=f"{contrast_ratio:.1f}:1",
                required_value=">= 3.0:1",
                violation_text=f"Numeral contrast ratio {contrast_ratio:.1f}:1 is below required minimum contrast 3.0:1 under Rule 9(1)(b)"
            ))

        status = "violation" if violations else "compliant"
        return status, violations

engine_instance = RulesEngine()
