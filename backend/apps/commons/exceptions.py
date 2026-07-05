"""
Custom exception classes and DRF exception handler.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from .error_codes import ErrorCodes
from django.conf import settings


class BusinessException(Exception):
    """业务异常基类 — 所有业务错误由此抛出"""

    def __init__(self, message, code=ErrorCodes.BAD_REQUEST, http_status=400):
        self.message = message
        self.code = code
        self.http_status = http_status
        super().__init__(self.message)


class InsufficientStockError(BusinessException):
    def __init__(self, product_name, available, requested):
        super().__init__(
            message=f'商品 [{product_name}] 库存不足：可用 {available}，请求 {requested}',
            code=ErrorCodes.INSUFFICIENT_STOCK,
        )


class InvalidStatusTransition(BusinessException):
    def __init__(self, current_status, target_action):
        super().__init__(
            message=f'当前状态 [{current_status}] 不允许执行 [{target_action}] 操作',
            code=ErrorCodes.INVALID_STATUS_TRANSITION,
        )


def custom_exception_handler(exc, context):
    """Global DRF exception handler — returns unified format."""
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data
        return Response(
            {
                'code': response.status_code * 100,
                'message': str(detail) if isinstance(detail, str) else '请求参数错误',
                'data': None,
                'errors': detail if isinstance(detail, dict) else None,
            },
            status=response.status_code,
        )

    if isinstance(exc, BusinessException):
        return Response(
            {
                'code': exc.code,
                'message': exc.message,
                'data': None,
            },
            status=exc.http_status,
        )

    if settings.DEBUG:
        raise exc

    return Response(
        {
            'code': 50000,
            'message': '服务器内部错误',
            'data': None,
        },
        status=500,
    )
