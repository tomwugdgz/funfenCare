from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.order import ServiceOrder
from app.schemas import OrderCreate, OrderUpdate, OrderResponse, ServiceType

router = APIRouter(prefix="/orders", tags=["服务订单"])


@router.post("/", response_model=OrderResponse, summary="创建服务订单")
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    """创建服务订单（上门打卡/陪聊/陪护）"""
    new_order = ServiceOrder(
        elder_id=order.elder_id,
        guardian_id=order.guardian_id,
        service_type=order.service_type,
        scheduled_at=order.scheduled_at,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # TODO: 推送订单到接单群/服务人员
    # await notify_caregivers(order.elder_id)
    
    return new_order


@router.get("/{order_id}", response_model=OrderResponse, summary="获取订单详情")
async def get_order(
    order_id: str,
    db: Session = Depends(get_db)
):
    """获取订单详情"""
    order = db.query(ServiceOrder).filter(ServiceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    return order


@router.get("/list", response_model=List[OrderResponse], summary="获取订单列表")
async def get_orders(
    user_id: Optional[str] = None,
    elder_id: Optional[str] = None,
    status: Optional[str] = None,
    service_type: Optional[ServiceType] = None,
    db: Session = Depends(get_db)
):
    """获取订单列表（可按用户/老人/状态/类型筛选）"""
    query = db.query(ServiceOrder)
    
    if user_id:
        query = query.filter(
            (ServiceOrder.guardian_id == user_id) |
            (ServiceOrder.caregiver_id == user_id)
        )
    if elder_id:
        query = query.filter(ServiceOrder.elder_id == elder_id)
    if status:
        query = query.filter(ServiceOrder.status == status)
    if service_type:
        query = query.filter(ServiceOrder.service_type == service_type)
    
    orders = query.order_by(ServiceOrder.created_at.desc()).all()
    return orders


@router.put("/{order_id}", response_model=OrderResponse, summary="更新订单")
async def update_order(
    order_id: str,
    update: OrderUpdate,
    db: Session = Depends(get_db)
):
    """更新订单状态（接单/完成/取消）"""
    order = db.query(ServiceOrder).filter(ServiceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if update.status is not None:
        order.status = update.status.value if hasattr(update.status, 'value') else update.status
        if order.status in ["completed", "cancelled"]:
            order.completed_at = datetime.utcnow()
    if update.caregiver_id is not None:
        order.caregiver_id = update.caregiver_id
    if update.feedback is not None:
        order.feedback = update.feedback
    if update.photos is not None:
        order.photos = update.photos
    if update.location is not None:
        order.location = update.location
    
    db.commit()
    db.refresh(order)
    
    # TODO: 通知监护人订单状态变更
    # await notify_guardian(order.guardian_id, order)
    
    return order


@router.get("/stats", summary="获取订单统计")
async def get_order_stats(
    elder_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取订单统计数据"""
    query = db.query(ServiceOrder)
    if elder_id:
        query = query.filter(ServiceOrder.elder_id == elder_id)
    
    total = query.count()
    pending = query.filter(ServiceOrder.status == "pending").count()
    completed = query.filter(ServiceOrder.status == "completed").count()
    
    return {
        "total": total,
        "pending": pending,
        "completed": completed,
        "completion_rate": round(completed / total * 100, 1) if total > 0 else 0
    }
