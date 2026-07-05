"""
State machine — validates and orchestrates document status transitions.
"""
from ..exceptions import InvalidStatusTransition


class StateMachine:
    """
    通用状态机 — 检查单据状态转换是否合法。

    TRANSITIONS 格式:
        action: {'from': [list of valid from-statuses], 'to': target_status or None (dynamic)}
    """

    TRANSITIONS = {
        'submit': {'from': ['draft'], 'to': 'pending'},
        'approve': {'from': ['pending'], 'to': 'confirmed'},
        'reject': {'from': ['pending'], 'to': 'draft'},
        'receive': {'from': ['confirmed', 'partially_received'], 'to': None},  # dynamic
        'deliver': {'from': ['confirmed', 'partially_delivered'], 'to': None},  # dynamic
        'cancel': {'from': ['draft', 'pending', 'confirmed', 'partially_received', 'partially_delivered'],
                   'to': 'cancelled'},
    }

    @classmethod
    def check_transition(cls, current_status: str, action: str):
        """检查状态转换是否允许，不允许则抛出 InvalidStatusTransition"""
        if action not in cls.TRANSITIONS:
            raise InvalidStatusTransition(current_status, action)

        allowed = cls.TRANSITIONS[action]['from']
        if current_status not in allowed:
            raise InvalidStatusTransition(current_status, action)

        return True
