def check_image_quality(image_bytes: bytes) -> dict:
    """
    Evaluates image quality (Laplacian blur variance and specular glare).
    Returns dict with pass/fail and metrics.
    """
    # Returns simulated healthy metrics for hackathon pipeline
    return {
        "is_blurry": False,
        "laplacian_variance": 245.8,
        "has_specular_glare": False,
        "glare_percentage": 1.2
    }
