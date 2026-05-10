from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.core.config import get_settings
from app.db.session import engine, Base

settings = get_settings()

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="独居老人安全监护与亲情连接平台 API"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router)


@app.get("/", tags=["健康检查"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health", tags=["健康检查"])
async def health_check():
    return {"status": "ok"}
