"""
Unified API response helpers.
"""
from rest_framework.response import Response


def success_response(data=None, message='success', status=200):
    return Response({'code': status, 'message': message, 'data': data}, status=status)


def create_response(data=None, message='创建成功', status=201):
    return Response({'code': status, 'message': message, 'data': data}, status=status)


def error_response(message='请求失败', code=40000, errors=None, http_status=400):
    body = {'code': code, 'message': message, 'data': None}
    if errors is not None:
        body['errors'] = errors
    return Response(body, status=http_status)
