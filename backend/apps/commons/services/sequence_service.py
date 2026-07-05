"""
Sequence number generator — thread-safe with select_for_update.
"""
from django.db import transaction
from django.utils import timezone
from ..models.sequence import Sequence


class SequenceService:
    """单据编号生成器 — 使用行级锁保证并发安全"""

    @classmethod
    @transaction.atomic
    def next_number(cls, prefix: str) -> str:
        """
        生成下一编号，格式: PREFIX-YYYYMMDD-NNNN
        使用 select_for_update 行级锁保证并发安全
        """
        now = timezone.localtime()
        year, month, day = now.year, now.month, now.day

        seq, _ = Sequence.objects.select_for_update().get_or_create(
            prefix=prefix,
            year=year,
            month=month,
            day=day,
            defaults={'last_number': 0},
        )

        seq.last_number += 1
        seq.save(update_fields=['last_number'])

        return f'{prefix}-{year}{month:02d}{day:02d}-{seq.last_number:04d}'
