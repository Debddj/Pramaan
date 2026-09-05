from typing import Optional
from pydantic import BaseModel


class QualityReport(BaseModel):
    is_blurry: bool
    laplacian_variance: float
    has_specular_glare: bool
    glare_percentage: float
    contrast_ratio: Optional[float] = None
    is_acceptable: bool
