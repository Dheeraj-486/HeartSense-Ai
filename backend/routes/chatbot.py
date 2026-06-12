from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.models.database_models import User, ChatHistory
from backend.schemas.schemas import ChatMessageCreate, ChatMessageOut
from backend.utils.security import get_current_user
from ai_models.biogpt.chatbot import generate_medical_reply

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

@router.post("/", response_model=ChatMessageOut)
def send_message(
    message_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_msg_text = message_in.message.strip()
    if not user_msg_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    # 1. Save User Message to Database
    user_chat = ChatHistory(
        user_id=current_user.id,
        message=user_msg_text,
        sender="user"
    )
    db.add(user_chat)
    db.commit()
    db.refresh(user_chat)

    # 2. Get past chat history to provide context to the AI model
    # Fetch last 10 messages for context
    history_records = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.timestamp.desc()).limit(10).all()
    
    # Reverse to keep chronological order
    history_records.reverse()
    
    chat_context = []
    for record in history_records:
        # Avoid including the user's current message twice since we already saved it
        if record.id == user_chat.id:
            continue
        chat_context.append({
            "role": "user" if record.sender == "user" else "assistant",
            "content": record.message
        })

    # 3. Generate Medical Reply using BioGPT engine
    try:
        reply_text = generate_medical_reply(user_msg_text, chat_history=chat_context)
    except Exception as e:
        reply_text = (
            "I apologize, but my medical reasoning core encountered an error. Please try again. "
            f"Details: {str(e)}"
        )

    # 4. Save Bot Response to Database
    bot_chat = ChatHistory(
        user_id=current_user.id,
        message=reply_text,
        sender="bot"
    )
    db.add(bot_chat)
    db.commit()
    db.refresh(bot_chat)

    return bot_chat

@router.get("/history", response_model=List[ChatMessageOut])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.timestamp.asc()).all()

@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return None
