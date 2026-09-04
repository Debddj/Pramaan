from pydantic import BaseModel
from typing import Optional, List, Any

class RuleDefinition(BaseModel):
    rule_id: str
    citation: str
    requirement: str
    applies_when: str
    check_type: str
    severity: str
    violation_template: str
