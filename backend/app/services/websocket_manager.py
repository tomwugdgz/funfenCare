"""
WebSocket 实时通知服务
- 管理WebSocket连接
- 推送实时数据（活动更新、异常预警、订单状态等）
- 广播与单播
"""

from typing import Dict, Set, List, Optional
import asyncio
import json
from datetime import datetime
from fastapi import WebSocket


class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 用户连接映射: user_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # 设备连接映射: device_id -> Set[WebSocket]
        self.device_connections: Dict[str, Set[WebSocket]] = {}
        # 房间连接映射: room -> Set[WebSocket]
        self.room_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """建立用户WebSocket连接"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """断开用户WebSocket连接"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def connect_device(self, websocket: WebSocket, device_id: str):
        """建立设备WebSocket连接"""
        await websocket.accept()
        if device_id not in self.device_connections:
            self.device_connections[device_id] = set()
        self.device_connections[device_id].add(websocket)
    
    async def disconnect_device(self, websocket: WebSocket, device_id: str):
        """断开设备WebSocket连接"""
        if device_id in self.device_connections:
            self.device_connections[device_id].discard(websocket)
            if not self.device_connections[device_id]:
                del self.device_connections[device_id]
    
    async def join_room(self, websocket: WebSocket, room: str):
        """加入房间"""
        if room not in self.room_connections:
            self.room_connections[room] = set()
        self.room_connections[room].add(websocket)
    
    async def leave_room(self, websocket: WebSocket, room: str):
        """离开房间"""
        if room in self.room_connections:
            self.room_connections[room].discard(websocket)
            if not self.room_connections[room]:
                del self.room_connections[room]
    
    async def send_personal_message(self, message: dict, user_id: str):
        """发送个人消息"""
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            # 清理断开的连接
            for conn in disconnected:
                self.active_connections[user_id].discard(conn)
    
    async def send_device_message(self, message: dict, device_id: str):
        """发送设备消息"""
        if device_id in self.device_connections:
            disconnected = set()
            for connection in self.device_connections[device_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            for conn in disconnected:
                self.device_connections[device_id].discard(conn)
    
    async def broadcast_to_room(self, message: dict, room: str):
        """广播到房间"""
        if room in self.room_connections:
            disconnected = set()
            for connection in self.room_connections[room]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            for conn in disconnected:
                self.room_connections[room].discard(conn)
    
    async def broadcast_to_elders_guardians(self, message: dict, elder_ids: List[str]):
        """广播给老人的所有监护人"""
        for elder_id in elder_ids:
            # 监护人订阅格式: "guardian_of_{elder_id}"
            room = f"guardian_of_{elder_id}"
            await self.broadcast_to_room(message, room)
    
    def get_online_count(self) -> Dict:
        """获取在线统计"""
        return {
            "users": sum(len(conns) for conns in self.active_connections.values()),
            "devices": sum(len(conns) for conns in self.device_connections.values()),
            "rooms": len(self.room_connections),
        }


# 全局实例
manager = ConnectionManager()
