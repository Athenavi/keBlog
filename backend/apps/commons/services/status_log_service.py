"""
Status log recording service.
"""
from django.contrib.contenttypes.models import ContentType
from ..models.status_log import StatusLog


class StatusLogService:
    """记录单据状态变更"""

    @staticmethod
    def log(obj, action: str, from_status: str, to_status: str,
            operator, remark: str = ''):
        StatusLog.objects.create(
            content_type=ContentType.objects.get_for_model(obj),
            object_id=obj.id,
            from_status=from_status,
            to_status=to_status,
            action=action,
            remark=remark,
            operator=operator,
        )
