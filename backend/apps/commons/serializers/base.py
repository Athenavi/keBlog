"""
Base serializer — auto-records created_by / updated_by.
"""
from rest_framework import serializers


class BaseModelSerializer(serializers.ModelSerializer):
    """模型序列化器基类，自动处理 created_by / updated_by"""

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data.setdefault('created_by', request.user)
            validated_data.setdefault('updated_by', request.user)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
        return super().update(instance, validated_data)
