"""
服务人员 API 路由
- 接单大厅
- 订单管理
- 打卡签到
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.order import ServiceOrder
from app.models.user import User
from app.schemas import OrderResponse, OrderUpdate

router = APIRouter(prefix="/caregiver", tags=["服务人员"])


@router.get("/available-orders", summary="获取可接订单列表")
async def get_available_orders(
    user_id: Optional[str] = None,
    service_type: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取可接订单（待接单状态）"""
    query = db.query(ServiceOrder).filter(ServiceOrder.status == "pending")
    
    if service_type:
        query = query.filter(ServiceOrder.service_type == service_type)
    
    # 按时间排序
    orders = query.order_by(ServiceOrder.scheduled_at).limit(50).all()
    
    # 计算距离（简化处理）
    result = []
    for order in orders:
        result.append({
            "id": str(order.id),
            "type": order.service_type,
            "type_name": {
                "door_check": "上门打卡",
                "chat": "陪聊服务",
                "companion": "陪护服务",
            }.get(order.service_type, order.service_type),
            "scheduled_at": order.scheduled_at.isoformat() if order.scheduled_at else None,
            "price": order.price,
            "notes": order.notes,
            "address": "天河区XX小区",  # 实际应从用户资料获取
        })
    
    return result


@router.post("/accept-order", summary="接单")
async def accept_order(
    order_id: str,
    caregiver_id: str,
    db: Session = Depends(get_db)
):
    """服务人员接单"""
    order = db.query(ServiceOrder).filter(ServiceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="订单不可接")
    
    order.status = "accepted"
    order.caregiver_id = caregiver_id
    db.commit()
    
    # TODO: 通知监护人订单已被接
    # await notify_guardian(order.guardian_id, order)
    
    return {"status": "ok", "message": "接单成功"}


@router.post("/checkin", summary="提交打卡记录")
async def submit_checkin(
    order_id: str,
    caregiver_id: str,
    latitude: float,
    longitude: float,
    photos: List[str] = None,
    status: str = "normal",
    notes: str = "",
    db: Session = Depends(get_db)
):
    """服务人员提交打卡记录"""
    order = db.query(ServiceOrder).filter(ServiceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if str(order.caregiver_id) != caregiver_id:
        raise HTTPException(status_code=403, detail="非此订单的服务人员")
    
    # 验证GPS位置
    # TODO: 实际应该验证是否在老人地址附近
    from datetime import datetime
    order.status = "completed"
    order.completed_at = datetime.utcnow()
    order.feedback = notes
    order.photos = photos
    order.location = {"lat": latitude, "lng": longitude}
    
    db.commit()
    
    # TODO: 通知监护人打卡完成
    # await notify_guardian(order.guardian_id, order)
    
    return {"status": "ok", "message": "打卡成功"}


@router.get("/my-orders", summary="获取我的订单")
async def get_my_orders(
    caregiver_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取服务人员的订单列表"""
    query = db.query(ServiceOrder).filter(ServiceOrder.caregiver_id == caregiver_id)
    
    if status:
        query = query.filter(ServiceOrder.status == status)
    
    orders = query.order_by(ServiceOrder.scheduled_at.desc()).all()
    return orders


@router.get("/stats", summary="获取服务人员统计")
async def get_caregiver_stats(
    caregiver_id: str,
    db: Session = Depends(get_db)
):
    """获取服务人员统计数据"""
    query = db.query(ServiceOrder).filter(ServiceOrder.caregiver_id == caregiver_id)
    
    total = query.count()
    completed = query.filter(ServiceOrder.status == "completed").count()
    
    return {
        "total_orders": total,
        "completed_orders": completed,
        "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
    }
