"""Compliance API routes."""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from typing import List, Optional
from app.compliance_engine import ComplianceEngine
from app.pdf_processor import extract_text_from_pdf, identify_document_type
from app.report_generator import generate_report
from pathlib import Path
import json
import io

router = APIRouter()

# Initialize engine once (loads model + builds vector DB on startup)
engine = ComplianceEngine(data_dir=Path(__file__).parent / "data")


@router.post("/analyze")
async def analyze_documents(
    business_plan: Optional[UploadFile] = File(None),
    data_privacy: Optional[UploadFile] = File(None),
    articles_of_association: Optional[UploadFile] = File(None),
):
    """Analyze uploaded PDF documents against QCB compliance rules.

    Uses AI-powered semantic search (FAISS vector DB) + spaCy NER + regex checks.
    Returns comprehensive compliance analysis with scores, gaps, resources,
    semantic rule matches, and entity extractions.
    """
    if not any([business_plan, data_privacy, articles_of_association]):
        raise HTTPException(status_code=400, detail="At least one document must be uploaded.")

    doc_map = {
        "business_plan": business_plan,
        "data_privacy": data_privacy,
        "articles_of_association": articles_of_association,
    }

    all_results = {}
    all_gaps = []
    all_resources = []
    uploaded_count = 0

    for doc_type, file in doc_map.items():
        if file is None:
            continue

        try:
            file_bytes = await file.read()
            text = extract_text_from_pdf(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing {doc_type}: {str(e)}")

        detected_type = identify_document_type(text)

        # Full AI analysis: NER + vector search + regex
        result = engine.analyze_document(text, doc_type)
        all_results[doc_type] = {
            "score": result["score"],
            "gaps": result["gaps"],
            "resources": result["resources"],
            "annotations": result["annotations"],
            "missing_requirements": result["missing_requirements"],
            "entities": result.get("entities", {}),
            "relevant_rules": result.get("relevant_rules", []),
            "detected_type": detected_type,
            "filename": file.filename,
        }
        all_gaps.extend(result["gaps"])
        all_resources.extend(result["resources"])
        uploaded_count += 1

    # Overall score
    scores = [r["score"] for r in all_results.values()]
    overall_score = sum(scores) / len(scores) if scores else 0

    # Deduplicate resources
    seen_resources = set()
    unique_resources = []
    for res in all_resources:
        key = res["name"]
        if key not in seen_resources:
            seen_resources.add(key)
            unique_resources.append(res)

    # Build frontend-compatible structures
    categories = _build_categories(all_results)

    critical_count = sum(1 for g in all_gaps if g["severity"] == "critical")
    high_count = sum(1 for g in all_gaps if g["severity"] == "high")
    total_gaps = len(all_gaps)

    risk_level = (
        "Critical" if critical_count > 3
        else "High" if critical_count > 0
        else "Medium" if high_count > 0
        else "Low"
    )
    audit_readiness = (
        "Very Low" if overall_score < 30
        else "Low" if overall_score < 50
        else "Medium" if overall_score < 70
        else "High"
    )

    return {
        "overallScore": round(overall_score, 1),
        "categories": categories,
        "stats": [
            {"title": "Risk Exposure", "value": risk_level, "change": f"{critical_count} critical", "isPositive": critical_count == 0},
            {"title": "Compliance Score", "value": f"{overall_score:.1f}%", "change": f"{total_gaps} gaps found", "isPositive": overall_score >= 70},
            {"title": "Critical Gaps", "value": str(critical_count), "change": f"+{high_count} high", "isPositive": critical_count == 0},
            {"title": "Audit Readiness", "value": audit_readiness, "change": f"{uploaded_count} docs analyzed", "isPositive": overall_score >= 70},
        ],
        "alerts": _build_alerts(all_gaps),
        "documentResults": all_results,
        "resources": unique_resources,
        "mappings": _build_mappings(categories, all_results),
    }


@router.post("/report")
async def generate_pdf_report(
    business_plan: Optional[UploadFile] = File(None),
    data_privacy: Optional[UploadFile] = File(None),
    articles_of_association: Optional[UploadFile] = File(None),
    lang: str = Form("en"),
):
    """Analyze documents and return a downloadable PDF compliance report."""
    if not any([business_plan, data_privacy, articles_of_association]):
        raise HTTPException(status_code=400, detail="At least one document must be uploaded.")

    doc_map = {
        "business_plan": business_plan,
        "data_privacy": data_privacy,
        "articles_of_association": articles_of_association,
    }

    all_results = {}
    all_gaps = []
    all_resources = []

    for doc_type, file in doc_map.items():
        if file is None:
            continue
        try:
            file_bytes = await file.read()
            text = extract_text_from_pdf(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing {doc_type}: {str(e)}")

        result = engine.analyze_document(text, doc_type)
        all_results[doc_type] = {
            "score": result["score"],
            "gaps": result["gaps"],
            "resources": result["resources"],
            "annotations": result["annotations"],
            "missing_requirements": result["missing_requirements"],
            "relevant_rules": result.get("relevant_rules", []),
            "detected_type": identify_document_type(text),
            "filename": file.filename,
        }
        all_gaps.extend(result["gaps"])
        all_resources.extend(result["resources"])

    scores = [r["score"] for r in all_results.values()]
    overall_score = sum(scores) / len(scores) if scores else 0

    seen = set()
    unique_resources = []
    for res in all_resources:
        if res["name"] not in seen:
            seen.add(res["name"])
            unique_resources.append(res)

    analysis_for_report = {
        "overallScore": round(overall_score, 1),
        "documentResults": all_results,
        "resources": unique_resources,
    }

    pdf_bytes = generate_report(analysis_for_report, lang=lang)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=qcb_compliance_report.pdf"},
    )


def _build_categories(results: dict) -> list:
    """Build assessment categories from analysis results."""
    category_map = {}

    for doc_type, doc_result in results.items():
        for gap in doc_result["gaps"]:
            cat_name = gap["category"]
            if cat_name not in category_map:
                category_map[cat_name] = []

            status = "Missing" if gap["severity"] == "critical" else "Partial"

            item = {
                "id": f"{doc_type}_{len(category_map[cat_name])}",
                "title": gap.get("description", "")[:80],
                "status": status,
                "reasoning": gap.get("description", ""),
                "improvementSuggestion": gap.get("improvement", ""),
                "article": gap.get("article", ""),
                "severity": gap["severity"],
                "documentType": gap.get("document_type", doc_type),
                "recommendedResources": [
                    {"name": r["name"], "type": r["type"], "contact": r.get("contact", "")}
                    for r in doc_result.get("resources", [])
                ],
            }
            category_map[cat_name].append(item)

    return [{"category": cat, "items": items} for cat, items in category_map.items()]


def _build_alerts(gaps: list) -> list:
    """Build alerts from critical/high gaps."""
    alerts = []
    for i, gap in enumerate(gaps):
        if gap["severity"] in ("critical", "high"):
            alerts.append({
                "id": str(i + 1),
                "severity": "high" if gap["severity"] == "critical" else "medium",
                "title": f"{gap['category']}: {gap['description'][:60]}",
                "time": "Just now",
                "description": gap.get("improvement", gap["description"]),
                "status": "new",
            })
    return alerts[:10]


def _build_mappings(categories: list, all_results: dict) -> list:
    """Build policy mapping items with full detail (reasoning, improvement, article, severity)."""
    mappings = []
    for cat in categories:
        for item in cat["items"]:
            score = 0 if item["status"] == "Missing" else 60 if item["status"] == "Partial" else 100
            mappings.append({
                "id": item["id"],
                "internalProcess": item["title"],
                "regulation": f"QCB Article {item.get('article', 'N/A')}",
                "status": item["status"].lower(),
                "score": score,
                # Full detail for click-to-expand
                "reasoning": item.get("reasoning", ""),
                "improvementSuggestion": item.get("improvementSuggestion", ""),
                "article": item.get("article", ""),
                "severity": item.get("severity", ""),
                "documentType": item.get("documentType", ""),
                "category": cat["category"],
                "recommendedResources": item.get("recommendedResources", []),
            })
    return mappings


@router.post("/analyze-single")
async def analyze_single_document(
    file: UploadFile = File(...),
    doc_type: str = Form("auto"),
):
    """Analyze a single uploaded PDF document."""
    try:
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

    if doc_type == "auto":
        doc_type = identify_document_type(text)
        if doc_type == "unknown":
            doc_type = "business_plan"

    result = engine.analyze_document(text, doc_type)

    return {
        "documentType": doc_type,
        "detectedType": identify_document_type(text),
        "filename": file.filename,
        "score": result["score"],
        "gaps": result["gaps"],
        "resources": result["resources"],
        "annotations": result["annotations"],
        "missingRequirements": result["missing_requirements"],
        "entities": result.get("entities", {}),
        "relevantRules": result.get("relevant_rules", []),
    }


@router.get("/regulations")
async def get_regulations():
    """Get all loaded regulatory rules for reference."""
    rules = engine.rules
    all_regs = []
    for fname, content in rules.items():
        for reg in content.get("regulations", []):
            all_regs.append({
                "id": reg["id"],
                "article": reg["article"],
                "title": reg["title"],
                "text": reg["text"],
                "category": reg["category"],
                "severity": reg["severity"],
                "source": fname,
            })
    return {"regulations": all_regs, "total": len(all_regs)}


@router.get("/resources")
async def get_resources():
    """Get available compliance resources, experts, and QDB programs."""
    return engine.resources
