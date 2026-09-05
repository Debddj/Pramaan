import io
import numpy as np
from typing import Tuple, Optional
from PIL import Image
import cv2
from app.schemas.quality import QualityReport


def decode_image(image_bytes: bytes) -> Optional[np.ndarray]:
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        arr = np.array(pil_img)
        if len(arr.shape) == 3 and arr.shape[2] == 4:
            arr = cv2.cvtColor(arr, cv2.COLOR_RGBA2RGB)
        return arr
    except Exception:
        return None


def check_blur(cv_image: np.ndarray, threshold: float = 100.0) -> Tuple[bool, float]:
    """
    Computes Laplacian variance.
    Variance < threshold (default 100) indicates significant motion or defocus blur.
    """
    if len(cv_image.shape) == 3:
        gray = cv2.cvtColor(cv_image, cv2.COLOR_RGB2GRAY)
    else:
        gray = cv_image
    variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = variance < threshold
    return is_blurry, variance


def check_glare(cv_image: np.ndarray, threshold_pct: float = 5.0) -> Tuple[bool, float]:
    """
    Counts near-saturated pixels (brightness >= 250).
    If > threshold_pct of pixels are saturated, specular glare is flagged.
    """
    if len(cv_image.shape) == 3:
        gray = cv2.cvtColor(cv_image, cv2.COLOR_RGB2GRAY)
    else:
        gray = cv_image
    saturated_pixels = int(np.sum(gray >= 250))
    total_pixels = gray.size
    glare_pct = (saturated_pixels / total_pixels) * 100.0 if total_pixels > 0 else 0.0
    has_glare = glare_pct > threshold_pct
    return has_glare, round(glare_pct, 2)


def check_contrast(cv_image: np.ndarray) -> float:
    """
    Computes luminance contrast ratio (p95 / p5).
    """
    if len(cv_image.shape) == 3:
        gray = cv2.cvtColor(cv_image, cv2.COLOR_RGB2GRAY)
    else:
        gray = cv_image
    p95 = float(np.percentile(gray, 95))
    p5 = float(np.percentile(gray, 5))
    ratio = (p95 + 0.05) / (max(p5, 1.0) + 0.05)
    return round(ratio, 2)


def assess_image_quality(image_bytes: bytes) -> QualityReport:
    """
    Runs full CV quality assessment on image bytes.
    """
    if not image_bytes:
        return QualityReport(
            is_blurry=True,
            laplacian_variance=0.0,
            has_specular_glare=False,
            glare_percentage=0.0,
            contrast_ratio=1.0,
            is_acceptable=False,
        )

    img = decode_image(image_bytes)
    if img is None:
        return QualityReport(
            is_blurry=True,
            laplacian_variance=0.0,
            has_specular_glare=False,
            glare_percentage=0.0,
            contrast_ratio=1.0,
            is_acceptable=False,
        )

    is_blurry, variance = check_blur(img)
    has_glare, glare_pct = check_glare(img)
    contrast = check_contrast(img)
    is_acceptable = (not is_blurry) and (not has_glare)

    return QualityReport(
        is_blurry=is_blurry,
        laplacian_variance=round(variance, 2),
        has_specular_glare=has_glare,
        glare_percentage=glare_pct,
        contrast_ratio=contrast,
        is_acceptable=is_acceptable,
    )


def check_image_quality(image_bytes: bytes) -> dict:
    """Backward-compatible wrapper returning dict."""
    rep = assess_image_quality(image_bytes)
    return rep.model_dump()
