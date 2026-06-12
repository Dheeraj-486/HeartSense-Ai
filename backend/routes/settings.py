from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.database_models import User, Settings
from backend.schemas.schemas import SettingsOut, SettingsUpdate
from backend.utils.security import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("/", response_model=SettingsOut)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        # Auto-create settings if not exists for some reason
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=SettingsOut)
def update_settings(
    settings_in: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        
    settings.dark_mode = settings_in.dark_mode
    settings.email_notifications = settings_in.email_notifications
    settings.weekly_reports = settings_in.weekly_reports
    
    db.commit()
    db.refresh(settings)
    return settings
