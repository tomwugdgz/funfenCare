from fastapi import APIRouter
from app.api import auth, devices, family, orders, reports, websocket

api_router = APIRouter(prefix="/api/v1")

# 注册路由
api_router.include_router(auth.router)
api_router.include_router(devices.router)
api_router.include_router(family.router)
api_router.include_router(orders.router)
api_router.include_router(reports.router)
api_router.include_router(websocket.router)
