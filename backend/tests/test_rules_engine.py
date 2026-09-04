import pytest
from app.schemas.scan import LabelDeclaration
from app.services.rules_engine.engine import RulesEngine

def test_compliant_package(compliant_declaration):
    engine = RulesEngine()
    # 100g package requires min 2.0mm numeral height under Rule 7 Table I
    # Measured height = 2.5 mm -> Compliant
    status, violations = engine.evaluate(
        decl=compliant_declaration,
        measured_height_mm=2.5,
        pdp_area_sq_cm=120.0,
        category="biscuits"
    )
    assert status == "compliant"
    assert len(violations) == 0

def test_undersized_font_violation(compliant_declaration):
    engine = RulesEngine()
    # 100g package requires 2.0mm. Measured is 1.5mm -> Rule 7 Violation
    status, violations = engine.evaluate(
        decl=compliant_declaration,
        measured_height_mm=1.5,
        pdp_area_sq_cm=120.0,
        category="biscuits"
    )
    assert status == "violation"
    rule_7_violations = [v for v in violations if v.rule_id == "LMPC-R7-TABLE-1"]
    assert len(rule_7_violations) == 1
    assert "Rule 7(2), Table I" in rule_7_violations[0].citation

def test_missing_mandatory_declarations():
    engine = RulesEngine()
    # Incomplete declaration: missing manufacturer, MRP, generic name
    empty_decl = LabelDeclaration()
    status, violations = engine.evaluate(decl=empty_decl)
    assert status == "violation"
    rule_ids = [v.rule_id for v in violations]
    assert "LMPC-R6-1-A" in rule_ids # Missing manufacturer
    assert "LMPC-R6-1-B" in rule_ids # Missing generic name
    assert "LMPC-R6-1-E" in rule_ids # Missing MRP
    assert "LMPC-R6-2-CARE" in rule_ids # Missing consumer care

def test_second_schedule_pack_size_violation(compliant_declaration):
    engine = RulesEngine()
    # 65g biscuits is NOT an approved Second Schedule size (25, 50, 75, 100, 150...)
    compliant_declaration.net_quantity_value = 65.0
    status, violations = engine.evaluate(
        decl=compliant_declaration,
        measured_height_mm=2.5,
        category="biscuits"
    )
    assert status == "violation"
    sched_violation = [v for v in violations if v.rule_id == "LMPC-R5-SECOND-SCHEDULE"]
    assert len(sched_violation) == 1
    assert "Second Schedule" in sched_violation[0].citation

def test_rule_26_small_package_exemption(compliant_declaration):
    engine = RulesEngine()
    # 5g sachet is exempted under Rule 26(a)
    compliant_declaration.net_quantity_value = 5.0
    compliant_declaration.net_quantity_unit = "g"
    # Even if numeral height is small (0.5mm), it is exempted!
    status, violations = engine.evaluate(
        decl=compliant_declaration,
        measured_height_mm=0.5,
        category="biscuits"
    )
    assert status == "exempt"
    assert len(violations) == 0
