"""
Voucher serializers.
"""
from rest_framework import serializers
from ..models.voucher import Voucher, VoucherLine


class VoucherLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherLine
        fields = '__all__'


class VoucherSerializer(serializers.ModelSerializer):
    lines = VoucherLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Voucher
        fields = '__all__'
        read_only_fields = ('voucher_no', 'created_at',)
