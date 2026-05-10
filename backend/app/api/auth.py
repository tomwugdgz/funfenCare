from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas import UserCreate, UserResponse, SMSCodeRequest, Token
from app.core.security import create_access_token
import random

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/send-sms", summary="发送短信验证码")
async def send_sms_code(
    request: SMSCodeRequest,
    db: Session = Depends(get_db)
):
    """
    发送短信验证码（登录/注册用）
    实际项目中应接入短信服务商API
    """
    # 生成4位验证码
    code = str(random.randint(1000, 9999))
    
    # TODO: 实际发送短信
    # await sms_service.send(request.phone, code)
    
    # 验证码存储到Redis（5分钟有效）
    # await redis.set(f"sms:{request.phone}", code, ex=300)
    
    # 开发模式直接返回验证码
    return {"message": "验证码已发送", "debug_code": code}


@router.post("/sms-login", response_model=Token, summary="短信验证码登录")
async def sms_login(
    request: UserCreate,
    db: Session = Depends(get_db)
):
    """短信验证码登录，不存在则自动注册"""
    
    # TODO: 验证验证码
    # stored_code = await redis.get(f"sms:{request.phone}")
    # if not stored_code or stored_code != request.sms_code:
    #     raise HTTPException(status_code=400, detail="验证码错误")
    
    # 查找或创建用户
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        user = User(phone=request.phone, role=request.role)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 创建JWT令牌
    access_token = create_access_token(
        data={"sub": str(user.id), "phone": user.phone, "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse, summary="获取当前用户信息")
async def get_current_user(
    db: Session = Depends(get_db)
):
    # TODO: 从JWT token获取用户ID
    # 这里简化处理
    raise HTTPException(status_code=401, detail="需要认证")
