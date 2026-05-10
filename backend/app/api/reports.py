from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.order import ServiceOrder
from app.models.device import CSIActivity, WifiDevice
from app.schemas import HealthReport, ActivitySummary

router = APIRouter(prefix="/reports", tags=["健康报告"])


@router.get("/daily/{user_id}", response_model=HealthReport, summary="获取健康日报")
async def get_daily_report(
    user_id: str,
    date: str = None,
    db: Session = Depends(get_db)
):
    """获取指定用户的健康日报"""
    if date:
        report_date = datetime.strptime(date, "%Y-%m-%d")
    else:
        report_date = datetime.utcnow()
    
    start = report_date.replace(hour=0, minute=0, second=0)
    end = start + timedelta(days=1)
    
    # 查找用户设备
    device = db.query(WifiDevice).filter(
        WifiDevice.elder_id == user_id
    ).first()
    
    if not device:
        raise HTTPException(status_code=404, detail="用户未绑定设备")
    
    # 获取活动数据
    activities = db.query(CSIActivity).filter(
        CSIActivity.device_id == device.id,
        CSIActivity.timestamp >= start,
        CSIActivity.timestamp < end
    ).order_by(CSIActivity.timestamp).all()
    
    # 计算活动摘要
    if activities:
        scores = [a.activity_score for a in activities]
        avg_score = int(sum(scores) / len(scores) * 100)
        anomaly = any(a.anomaly_score and a.anomaly_score > 0.7 for a in activities)
    else:
        avg_score = 0
        anomaly = False
    
    # 获取今日服务记录
    services = db.query(ServiceOrder).filter(
        ServiceOrder.elder_id == user_id,
        ServiceOrder.scheduled_at >= start,
        ServiceOrder.scheduled_at < end
    ).all()
    
    # AI分析建议
    insights = generate_ai_insights(avg_score, anomaly, activities)
    
    return HealthReport(
        user_id=user_id,
        date=report_date.strftime("%Y-%m-%d"),
        summary=ActivitySummary(
            activity_score=avg_score,
            anomaly_detected=anomaly,
        ),
        ai_insights=insights,
        services_today=[{
            "type": s.service_type,
            "status": s.status,
            "feedback": s.feedback
        } for s in services]
    )


def generate_ai_insights(score, anomaly, activities):
    """生成AI分析建议"""
    insights = []
    
    if score >= 80:
        insights.append("今日活动量良好，继续保持")
    elif score >= 50:
        insights.append("今日活动量正常，可适当增加活动")
    else:
        insights.append("今日活动量偏低，建议关注")
    
    if anomaly:
        insights.append("检测到异常活动模式，建议确认老人安全")
    
    # 检查作息
    if activities:
        first_activity = min(activities, key=lambda a: a.timestamp)
        if first_activity.timestamp.hour >= 9:
            insights.append("今日起床时间较晚，建议了解原因")
    
    return insights
