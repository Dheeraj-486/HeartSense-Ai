import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.models.database_models import User, Report
from backend.schemas.schemas import ReportOut
from backend.utils.security import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")

@router.get("/", response_model=List[ReportOut])
def get_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()

@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report record not found."
        )
        
    filename = report.report_path.split("/")[-1]
    local_path = os.path.join(REPORTS_DIR, filename)
    
    if not os.path.exists(local_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on disk. It might have been deleted."
        )
        
    return FileResponse(
        path=local_path,
        media_type="application/pdf",
        filename=f"cardio_health_report_{report.id}.pdf"
    )

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )
        
    # Delete physical file if exists
    if report.report_path.startswith("/static/reports/"):
        filename = report.report_path.split("/")[-1]
        local_path = os.path.join(REPORTS_DIR, filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass
                
    db.delete(report)
    db.commit()
    return None
