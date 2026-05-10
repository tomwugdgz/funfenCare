from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.family import FamilyRelation
from app.models.user import User
from app.schemas import FamilyBind, FamilyResponse, UserResponse

router = APIRouter(prefix="/family", tags=["亲情圈"])


@router.post("/bind", summary="绑定亲情关系")
async def bind_family(
    bind: FamilyBind,
    db: Session = Depends(get_db)
):
    """监护人绑定独居老人"""
    # 检查关系是否已存在
    existing = db.query(FamilyRelation).filter(
        FamilyRelation.guardian_id == bind.guardian_id,
        FamilyRelation.elder_id == bind.elder_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="亲情关系已存在")
    
    # 验证用户存在
    guardian = db.query(User).filter(User.id == bind.guardian_id).first()
    elder = db.query(User).filter(User.id == bind.elder_id).first()
    if not guardian or not elder:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    relation = FamilyRelation(
        guardian_id=bind.guardian_id,
        elder_id=bind.elder_id,
        relationship=bind.relationship
    )
    db.add(relation)
    db.commit()
    db.refresh(relation)
    
    return {"status": "ok", "message": "绑定成功"}


@router.get("/guardians/{elder_id}", response_model=List[UserResponse], summary="获取老人的监护人列表")
async def get_guardians(
    elder_id: str,
    db: Session = Depends(get_db)
):
    """获取指定老人的所有监护人"""
    relations = db.query(FamilyRelation).filter(
        FamilyRelation.elder_id == elder_id
    ).all()
    guardian_ids = [r.guardian_id for r in relations]
    guardians = db.query(User).filter(User.id.in_(guardian_ids)).all()
    return guardians


@router.get("/elders/{guardian_id}", response_model=List[UserResponse], summary="获取监护人关注的老人列表")
async def get_elders(
    guardian_id: str,
    db: Session = Depends(get_db)
):
    """获取监护人关注的所有老人"""
    relations = db.query(FamilyRelation).filter(
        FamilyRelation.guardian_id == guardian_id
    ).all()
    elder_ids = [r.elder_id for r in relations]
    elders = db.query(User).filter(User.id.in_(elder_ids)).all()
    return elders


@router.delete("/unbind", summary="解除亲情关系")
async def unbind_family(
    guardian_id: str,
    elder_id: str,
    db: Session = Depends(get_db)
):
    """解除监护人与老人的关系"""
    relation = db.query(FamilyRelation).filter(
        FamilyRelation.guardian_id == guardian_id,
        FamilyRelation.elder_id == elder_id
    ).first()
    if not relation:
        raise HTTPException(status_code=404, detail="亲情关系不存在")
    
    db.delete(relation)
    db.commit()
    return {"status": "ok", "message": "解除成功"}
