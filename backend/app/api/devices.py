from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.device import WifiDevice, CSIActivity, AIUserProfile
from app.models.user import User
from app.schemas import DeviceCreate, DeviceResponse, CSIReport, ActivitySummary

router = APIRouter(prefix="/devices", tags=["设备管理"])


@router.post("/", response_model=DeviceResponse, summary="绑定WiFi体感设备")
async def bind_device(
    device: DeviceCreate,
    db: Session = Depends(get_db)
):
    """绑定WiFi体感设备到独居用户"""
    existing = db.query(WifiDevice).filter(
        WifiDevice.device_token == device.device_token
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="设备已被绑定")
    
    new_device = WifiDevice(
        elder_id=device.elder_id,
        device_token=device.device_token,
        device_name=device.device_name
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device


@router.post("/csi/report", summary="CSI数据上报")
async def report_csi(
    report: CSIReport,
    db: Session = Depends(get_db)
):
    """接收WiFi体感设备的CSI数据上报"""
    # 更新设备在线状态
    device = db.query(WifiDevice).filter(
        WifiDevice.id == report.device_id
    ).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")
    
    from datetime import datetime
    device.last_seen = datetime.utcnow()
    device.status = "online"
    
    # 存储CSI活动数据
    activity = CSIActivity(
        device_id=report.device_id,
        timestamp=datetime.utcnow(),
        activity_score=report.activity_score,
        anomaly_score=report.anomaly_score,
        raw_data=report.raw_data
    )
    db.add(activity)
    db.commit()
    
    # TODO: 触发AI异常检测
    # if report.anomaly_score > threshold:
    #     await notify_guardians(device.elder_id)
    
    return {"status": "ok", "message": "数据已接收"}


@router.get("/{device_id}/activity", response_model=ActivitySummary, summary="查询活动数据")
async def get_activity(
    device_id: str,
    date: str = None,
    db: Session = Depends(get_db)
):
    """获取指定设备的活动数据摘要"""
    from datetime import datetime, timedelta
    
    if date:
        start = datetime.strptime(date, "%Y-%m-%d")
        end = start + timedelta(days=1)
    else:
        start = datetime.utcnow().replace(hour=0, minute=0, second=0)
        end = start + timedelta(days=1)
    
    activities = db.query(CSIActivity).filter(
        CSIActivity.device_id == device_id,
        CSIActivity.timestamp >= start,
        CSIActivity.timestamp < end
    ).order_by(CSIActivity.timestamp).all()
    
    if not activities:
        return ActivitySummary(activity_score=0, anomaly_detected=False)
    
    # 计算活动摘要
    scores = [a.activity_score for a in activities]
    avg_score = sum(scores) / len(scores) * 100
    
    # 检测异常
    anomaly_detected = any(
        a.anomaly_score and a.anomaly_score > 0.7 for a in activities
    )
    
    # 生成每小时数据
    hourly_data = []
    for hour in range(24):
        hour_activities = [
            a for a in activities 
            if a.timestamp.hour == hour
        ]
        if hour_activities:
            avg = sum(a.activity_score for a in hour_activities) / len(hour_activities)
        else:
            avg = 0
        hourly_data.append({"hour": hour, "activity": round(avg, 2)})
    
    return ActivitySummary(
        activity_score=round(avg_score),
        anomaly_detected=anomaly_detected,
        hourly_data=hourly_data
    )


@router.get("/my", response_model=List[DeviceResponse], summary="获取我的设备列表")
async def get_my_devices(
    elder_id: str,
    db: Session = Depends(get_db)
):
    """获取指定用户的所有设备"""
    devices = db.query(WifiDevice).filter(
        WifiDevice.elder_id == elder_id
    ).all()
    return devices
