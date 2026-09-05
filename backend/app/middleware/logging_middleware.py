import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import structlog

logger = structlog.get_logger("pramaan.access")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        client_ip = request.client.host if request.client else "unknown"
        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms,
            client_ip=client_ip,
        )
        return response
