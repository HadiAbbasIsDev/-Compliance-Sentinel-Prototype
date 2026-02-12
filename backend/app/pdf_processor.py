"""PDF processing utilities for text extraction."""
import fitz  # PyMuPDF
import io
import re
from typing import Dict, List, Any


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full text content from PDF bytes."""
    text_parts = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {e}")
    return "\n".join(text_parts)


def identify_document_type(text: str) -> str:
    """Identify document type based on content patterns."""
    text_lower = text.lower()

    if re.search(r"business\s+plan|executive\s+summary|market\s+analysis|revenue\s+model", text_lower):
        return "business_plan"
    elif re.search(r"privacy\s+policy|data\s+protection|personal\s+data|data\s+handling", text_lower):
        return "data_privacy"
    elif re.search(r"articles\s+of\s+association|incorporation|company\s+constitution|memorandum\s+of\s+association", text_lower):
        return "articles_of_association"

    return "unknown"
