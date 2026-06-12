import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database.connection import get_db
from backend.models.database_models import User, Prediction, Report
from backend.schemas.schemas import PredictionOut
from backend.utils.security import get_current_user
from ai_models.vit.predictor import predict_scan
from backend.services.pdf_report import generate_pdf_report

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

# Define upload and report directories
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}

@router.post("/upload", response_model=PredictionOut, status_code=status.HTTP_201_CREATED)
async def upload_scan(
    file: UploadFile = File(...),
    image_type: Optional[str] = Form("AUTO"),  # Optional scan type, defaults to AUTO
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate scan type if provided (and not AUTO)
    image_type_upper = image_type.upper() if image_type else "AUTO"
    if image_type_upper != "AUTO" and image_type_upper not in {"ECG", "MRI", "CT", "X-RAY"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan type. Must be ECG, MRI, CT, or X-Ray."
        )

    # Save uploaded file with unique name
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )

    # Execute AI Prediction Engine
    try:
        analysis = predict_scan(file_path, image_type_upper)
    except Exception as e:
        # Cleanup uploaded file if prediction fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"AI model inference failed: {str(e)}"
        )

    # Save prediction to DB
    # We store relative path to serve it easily if static files are mounted
    relative_image_path = f"/static/uploads/{unique_filename}"
    
    new_prediction = Prediction(
        user_id=current_user.id,
        image_type=analysis["scan_type"],  # Save model detected scan type
        image_path=relative_image_path,
        disease=analysis["disease"],
        confidence=analysis["confidence"],
        probability=analysis["probability"],
        risk_level=analysis["risk_level"],
        explanation=analysis["explanation"]
    )
    
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    # Automatically generate PDF Report
    report_filename = f"report_{new_prediction.id}_{uuid.uuid4().hex[:8]}.pdf"
    report_path = os.path.join(REPORTS_DIR, report_filename)
    relative_report_path = f"/static/reports/{report_filename}"

    try:
        generate_pdf_report(
            user_name=current_user.full_name,
            user_email=current_user.email,
            prediction_data={
                "disease": new_prediction.disease,
                "confidence": new_prediction.confidence,
                "probability": new_prediction.probability,
                "risk_level": new_prediction.risk_level,
                "explanation": new_prediction.explanation,
                "model_used": analysis["model_used"],
                "scan_type": new_prediction.image_type
            },
            output_pdf_path=report_path
        )
        
        # Save Report record to database
        new_report = Report(
            user_id=current_user.id,
            prediction_id=new_prediction.id,
            report_path=relative_report_path
        )
        db.add(new_report)
        db.commit()
    except Exception as e:
        # Log error, but don't fail the prediction response
        print(f"Error generating PDF report: {e}")

    return new_prediction

@router.get("/", response_model=List[PredictionOut])
def get_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).all()

@router.get("/{prediction_id}", response_model=PredictionOut)
def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found."
        )
    return prediction

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found."
        )
        
    # Delete local image file if exists
    if prediction.image_path.startswith("/static/uploads/"):
        fname = prediction.image_path.split("/")[-1]
        local_path = os.path.join(UPLOAD_DIR, fname)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass
                
    # Associated report file will be cleaned up in cascade or delete
    report = db.query(Report).filter(Report.prediction_id == prediction.id).first()
    if report and report.report_path.startswith("/static/reports/"):
        rfname = report.report_path.split("/")[-1]
        rlocal_path = os.path.join(REPORTS_DIR, rfname)
        if os.path.exists(rlocal_path):
            try:
                os.remove(rlocal_path)
            except Exception:
                pass

    db.delete(prediction)
    db.commit()
    return None
