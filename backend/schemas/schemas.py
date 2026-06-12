import datetime
from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    profile_picture: Optional[str] = None
    created_at: datetime.datetime

    @field_serializer('created_at')
    def serialize_created_at(self, val: datetime.datetime):
        if val.tzinfo is None:
            val = val.replace(tzinfo=datetime.timezone.utc)
        return val.astimezone().replace(tzinfo=None).isoformat()

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# Settings Schemas
class SettingsBase(BaseModel):
    dark_mode: bool = False
    email_notifications: bool = True
    weekly_reports: bool = False

class SettingsUpdate(SettingsBase):
    pass

class SettingsOut(SettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionOut(BaseModel):
    id: int
    user_id: int
    image_type: str
    image_path: str
    disease: str
    confidence: float
    probability: float
    risk_level: str
    explanation: str
    created_at: datetime.datetime
    report_path: Optional[str] = None
    report_id: Optional[int] = None

    @field_serializer('created_at')
    def serialize_created_at(self, val: datetime.datetime):
        if val.tzinfo is None:
            val = val.replace(tzinfo=datetime.timezone.utc)
        return val.astimezone().replace(tzinfo=None).isoformat()

    class Config:
        from_attributes = True

# Report Schemas
class ReportOut(BaseModel):
    id: int
    user_id: int
    prediction_id: int
    report_path: str
    created_at: datetime.datetime

    @field_serializer('created_at')
    def serialize_created_at(self, val: datetime.datetime):
        if val.tzinfo is None:
            val = val.replace(tzinfo=datetime.timezone.utc)
        return val.astimezone().replace(tzinfo=None).isoformat()

    class Config:
        from_attributes = True

# Chatbot Schemas
class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageOut(BaseModel):
    id: int
    user_id: int
    message: str
    sender: str
    timestamp: datetime.datetime

    @field_serializer('timestamp')
    def serialize_timestamp(self, val: datetime.datetime):
        if val.tzinfo is None:
            val = val.replace(tzinfo=datetime.timezone.utc)
        return val.astimezone().replace(tzinfo=None).isoformat()

    class Config:
        from_attributes = True

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_predictions: int
    reports_generated: int
    chat_sessions: int
    accuracy_score: float
    recent_predictions: List[PredictionOut]
    disease_distribution: List[dict]  # List of {"name": "Disease", "value": count}
    prediction_trends: List[dict]  # List of {"date": "YYYY-MM-DD", "count": count}
