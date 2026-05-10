from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import get_settings
from app.models.user import User

settings = get_settings()
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建JWT访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """解码JWT令牌"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """获取当前认证用户"""
    payload = decode_access_token(credentials.credentials)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无法验证用户身份",
        )
    # 从数据库获取用户
    from app.db.session import get_db
    from app.models.user import get_user_by_id

    # 注意：这里需要通过依赖注入获取db session
    # 实际使用时应在API路由中处理
    return User(id=user_id, phone=payload.get("phone", ""))


def get_current_user_role(required_role: str):
    """角色权限装饰器"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in ["admin", required_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="权限不足",
            )
        return current_user
    return role_checker
