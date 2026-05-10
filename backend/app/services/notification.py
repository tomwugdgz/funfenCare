"""
通知服务
- 推送通知（App推送/短信/微信）
- 异常预警通知
- 订单状态变更通知
"""

from typing import List, Optional
import asyncio
from datetime import datetime


class NotificationService:
    """通知服务"""
    
    def __init__(self):
        # 实际项目中初始化短信服务、微信服务等
        self.sms_enabled = False
        self.wechat_enabled = False
        self.push_enabled = True
    
    async def send_emergency_alert(
        self,
        guardian_ids: List[str],
        elder_id: str,
        elder_name: str,
        alert_type: str,
        details: str
    ):
        """发送紧急预警通知"""
        message = f"【紧急预警】{elder_name}检测到异常：{details}"
        
        # 并发发送多种通知
        tasks = []
        
        # 1. App推送
        tasks.append(self._push_to_app(guardian_ids, message, "emergency"))
        
        # 2. 短信通知
        tasks.append(self._send_sms(guardian_ids, message))
        
        # 3. 语音电话（最高优先级）
        tasks.append(self._voice_call(guardian_ids[0], message))
        
        await asyncio.gather(*tasks, return_exceptions=True)
        
        return {"status": "sent", "guardians_notified": len(guardian_ids)}
    
    async def send_order_notification(
        self,
        guardian_id: str,
        order_id: str,
        order_type: str,
        status: str,
        details: Optional[str] = None
    ):
        """发送订单状态变更通知"""
        type_map = {
            "door_check": "上门打卡",
            "chat": "陪聊服务",
            "companion": "陪护服务"
        }
        
        status_map = {
            "accepted": "已被接单",
            "in_progress": "服务进行中",
            "completed": "已完成",
            "cancelled": "已取消"
        }
        
        message = f"【服务通知】您的{type_map.get(order_type, order_type)}订单{status_map.get(status, status)}"
        if details:
            message += f"：{details}"
        
        await self._push_to_app([guardian_id], message, "order_update")
    
    async def send_daily_report(
        self,
        guardian_id: str,
        elder_name: str,
        report_summary: dict
    ):
        """发送每日健康报告"""
        score = report_summary.get("activity_score", 0)
        anomaly = report_summary.get("anomaly_detected", False)
        
        if anomaly:
            message = f"【健康日报】{elder_name}今日活动异常，请查看详情"
        elif score >= 80:
            message = f"【健康日报】{elder_name}今日状态良好，活动量{score}分"
        else:
            message = f"【健康日报】{elder_name}今日活动量{score}分，点击查看详情"
        
        await self._push_to_app([guardian_id], message, "daily_report")
    
    async def _push_to_app(self, user_ids: List[str], message: str, notification_type: str):
        """App推送通知"""
        # 实际项目中使用 Firebase/个推/极光推送等
        print(f"[PUSH] To {user_ids}: {message}")
        return True
    
    async def _send_sms(self, user_ids: List[str], message: str):
        """短信通知"""
        if not self.sms_enabled:
            return False
        
        # 实际项目中调用短信API
        print(f"[SMS] To {user_ids}: {message}")
        return True
    
    async def _voice_call(self, user_id: str, message: str):
        """语音电话通知"""
        # 实际项目中调用语音通知API
        print(f"[VOICE CALL] To {user_id}: {message}")
        return True


# 全局实例
notification_service = NotificationService()
