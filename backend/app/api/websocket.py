"""
WebSocket API 路由
- 用户实时通知
- 设备数据推送
- 群组广播
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Optional
import json
import asyncio
from datetime import datetime

from app.services.websocket_manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/user/{user_id}")
async def websocket_user_endpoint(websocket: WebSocket, user_id: str):
    """
    用户WebSocket连接
    用于接收：
    - 实时监控数据更新
    - 异常预警通知
    - 订单状态变更
    - 聊天消息
    """
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # 接收客户端消息（心跳/订阅等）
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
                
                elif msg_type == "subscribe":
                    # 订阅老人的动态（监护人用）
                    elder_id = message.get("elder_id")
                    if elder_id:
                        await manager.join_room(websocket, f"guardian_of_{elder_id}")
                        await websocket.send_json({
                            "type": "subscribed",
                            "room": f"guardian_of_{elder_id}"
                        })
                
                elif msg_type == "unsubscribe":
                    elder_id = message.get("elder_id")
                    if elder_id:
                        await manager.leave_room(websocket, f"guardian_of_{elder_id}")
                        await websocket.send_json({
                            "type": "unsubscribed",
                            "room": f"guardian_of_{elder_id}"
                        })
                        
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)


@router.websocket("/ws/device/{device_id}")
async def websocket_device_endpoint(websocket: WebSocket, device_id: str):
    """
    设备WebSocket连接
    用于：
    - CSI数据实时上报（替代HTTP轮询）
    - 设备状态监控
    """
    await manager.connect_device(websocket, device_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                
                elif message.get("type") == "csi_data":
                    # 设备上报CSI数据
                    # 注意：实际处理应在后端服务层
                    await websocket.send_json({
                        "type": "csi_received",
                        "status": "ok"
                    })
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        await manager.disconnect_device(websocket, device_id)


@router.websocket("/ws/room/{room_name}")
async def websocket_room_endpoint(websocket: WebSocket, room_name: str):
    """
    群组WebSocket连接
    用于：
    - 兴趣社群聊天
    - 服务接单群
    - 家庭群组
    """
    await websocket.accept()
    await manager.join_room(websocket, room_name)
    
    try:
        while True:
            data = await websocket.receive_text()
            # 广播到房间
            await manager.broadcast_to_room({
                "type": "room_message",
                "room": room_name,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }, room_name)
            
    except WebSocketDisconnect:
        await manager.leave_room(websocket, room_name)


@router.get("/ws/stats", summary="获取WebSocket在线统计")
async def get_ws_stats():
    """获取WebSocket连接统计"""
    return manager.get_online_count()
