import os
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to calculate total page count and draw consistent footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Draw a line above footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 45, 576, 45)
        
        # Footer text
        footer_text = "AI Medical Chatbot Platform — Confidential Health Assessment"
        self.drawString(36, 30, footer_text)
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_str)
        self.restoreState()


def generate_pdf_report(user_name: str, user_email: str, prediction_data: dict, output_pdf_path: str) -> str:
    """
    Generates a high-quality PDF report for a heart disease prediction.
    """
    # Create parent folder if not exists
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor("#2563EB"),
        spaceAfter=25
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor("#334155"),
        leading=14,
        spaceAfter=10
    )
    
    body_bold = ParagraphStyle(
        'DocBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=colors.HexColor("#94A3B8"),
        leading=11,
        spaceBefore=20
    )

    story = []

    # Title
    story.append(Paragraph("CARDIOVASCULAR HEALTH ASSESSMENT", title_style))
    story.append(Paragraph(f"AI-Powered Diagnostic Screening Report — {datetime.date.today().strftime('%B %d, %Y')}", subtitle_style))
    
    # User Metadata Section
    story.append(Paragraph("Patient Information", h1_style))
    user_data = [
        [Paragraph("Full Name:", body_bold), Paragraph(user_name, body_style), Paragraph("Date Generated:", body_bold), Paragraph(datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p"), body_style)],
        [Paragraph("Email Address:", body_bold), Paragraph(user_email, body_style), Paragraph("Scan Category:", body_bold), Paragraph(prediction_data.get("scan_type", "ECG").upper(), body_style)]
    ]
    
    user_table = Table(user_data, colWidths=[100, 170, 100, 170])
    user_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
    ]))
    story.append(user_table)
    story.append(Spacer(1, 15))

    # AI Diagnostic Result Section
    story.append(Paragraph("Diagnostic Screening Result", h1_style))
    
    risk_color = "#22C55E"  # Green
    if prediction_data.get("risk_level", "").upper() == "HIGH":
        risk_color = "#EF4444"  # Red
    elif prediction_data.get("risk_level", "").upper() == "MEDIUM":
        risk_color = "#F59E0B"  # Amber
        
    risk_html = f"<font color='{risk_color}'><b>{prediction_data.get('risk_level', 'LOW')}</b></font>"
    
    pred_data = [
        [Paragraph("Predicted Finding:", body_bold), Paragraph(prediction_data.get("disease", "Normal Healthy Heart"), body_bold)],
        [Paragraph("Confidence Score:", body_bold), Paragraph(f"{prediction_data.get('probability', 99.0)}% ({prediction_data.get('confidence', 0.99)})", body_style)],
        [Paragraph("Assessed Risk Level:", body_bold), Paragraph(risk_html, body_style)],
        [Paragraph("Analysis Engine:", body_bold), Paragraph(prediction_data.get("model_used", "google/vit-base-patch16-224"), body_style)]
    ]
    
    pred_table = Table(pred_data, colWidths=[150, 390])
    pred_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
    ]))
    story.append(pred_table)
    story.append(Spacer(1, 15))

    # Explanation Section
    story.append(Paragraph("Clinical Explanation", h1_style))
    explanation_paragraph = Paragraph(prediction_data.get("explanation", "No further explanation provided."), body_style)
    story.append(explanation_paragraph)
    story.append(Spacer(1, 10))

    # Recommendations Section
    story.append(Paragraph("Recommended Clinical Guidance & Actions", h1_style))
    recommendations = []
    if prediction_data.get("risk_level", "").upper() == "HIGH":
        recommendations = [
            "**Urgent Cardiological Evaluation**: Coordinate a professional consultation with a licensed cardiologist immediately.",
            "**Followup Diagnostics**: Recommend full 12-lead ECG, cardiac enzymes, and an echocardiogram.",
            "**Activity Management**: Limit strenuous physical exertion until cleared by your primary cardiac care team.",
            "**Symptom Monitoring**: If experiencing active chest pressure, radiating pain, shortness of breath, or sweating, present to the nearest emergency department immediately."
        ]
    elif prediction_data.get("risk_level", "").upper() == "MEDIUM":
        recommendations = [
            "**Routine Medical Review**: Schedule a clinical visit with your general practitioner or internist within 7-14 days.",
            "**Risk Factor Control**: Monitor and record blood pressure, cholesterol levels, and blood sugar values weekly.",
            "**Lifestyle Modifications**: Transition to a sodium-restricted diet, increase physical exercise to 30 mins/day as tolerated, and reduce caffeine or alcohol intake.",
            "**Followup Scan**: Re-scan or perform localized checks in 3 to 6 months as recommended by your physician."
        ]
    else:
        recommendations = [
            "**Preventative Health**: Continue routine cardiovascular exercise (150 minutes/week) and consume a balanced whole-food diet.",
            "**Regular Screenings**: Participate in annual wellness checkups and standard blood pressure evaluations.",
            "**General Health Maintenance**: Ensure quality sleep, effective stress management, and complete avoidance of smoking or tobacco products."
        ]

    for rec in recommendations:
        bullet_text = f"• {rec}"
        story.append(Paragraph(bullet_text, body_style))
        
    story.append(Spacer(1, 20))

    # Disclaimer Section
    story.append(Paragraph(
        "<b>CLINICAL DISCLAIMER:</b> This assessment is generated automatically using artificial intelligence models. "
        "It is for educational, research, and screening purposes only and DOES NOT constitute professional medical diagnosis, "
        "treatment, or advice. The results are not guaranteed to be 100% accurate. Please review these findings with "
        "a qualified physician or cardiologist before making any changes to your healthcare or medication regimens.",
        disclaimer_style
    ))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    return output_pdf_path
