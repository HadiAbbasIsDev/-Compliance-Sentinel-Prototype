"""Compliance engine for regulatory document analysis — full AI-driven version.

Uses:
- sentence-transformers + FAISS for semantic search against QCB regulatory vector DB
- spaCy NER for entity extraction
- Regex rule checks per document type
"""
import json
import re
from typing import Dict, List, Tuple, Any
from pathlib import Path
import numpy as np

# Optional heavy imports — graceful fallback
try:
    from sentence_transformers import SentenceTransformer
    HAS_SBERT = True
except Exception:
    HAS_SBERT = False

try:
    import faiss
    HAS_FAISS = True
except Exception:
    HAS_FAISS = False

try:
    import spacy
    try:
        _NLP = spacy.load("en_core_web_sm")
        HAS_SPACY = True
    except Exception:
        _NLP = None
        HAS_SPACY = False
except Exception:
    HAS_SPACY = False
    _NLP = None


class ComplianceEngine:
    """AI-powered compliance engine: vector search + NER + regex checks."""

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = Path(__file__).parent / "data"
        self.data_dir = Path(data_dir)
        self.rules = self._load_rules()
        self.resources = self._load_resources()

        # NLP components
        self.nlp = _NLP

        # Sentence-transformer encoder + FAISS index
        self.encoder = None
        self.index = None
        self.rule_texts: List[str] = []
        self.rule_metadata: List[Dict[str, Any]] = []

        if HAS_SBERT:
            try:
                self.encoder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
                self._build_vector_index()
                print(f"[ComplianceEngine] Vector DB built — {len(self.rule_texts)} rule embeddings indexed")
            except Exception as e:
                print(f"[ComplianceEngine] Could not build vector index: {e}")

    # ── Data loading ──────────────────────────────────────────

    def _load_rules(self) -> Dict[str, Any]:
        rules = {}
        rule_files = [
            "updated_consumer_protection.json",
            "licensing_pathways.json",
            "QCB_Artificial_Intelligence_Guideline.json",
            "FENTECHStrategy_EN.json",
        ]
        for fname in rule_files:
            try:
                with open(self.data_dir / fname) as f:
                    rules[fname] = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load {fname}: {e}")
        return rules

    def _load_resources(self) -> Dict[str, Any]:
        try:
            with open(self.data_dir / "resource_mapping.json") as f:
                return json.load(f)
        except Exception:
            return {}

    # ── Vector index ──────────────────────────────────────────

    def _build_vector_index(self):
        """Build FAISS index over all rule texts for semantic retrieval."""
        if not self.encoder or not HAS_FAISS:
            return
        self.rule_texts = []
        self.rule_metadata = []
        for fname, content in self.rules.items():
            self._extract_rule_texts(content, fname)
        if not self.rule_texts:
            return
        embeddings = self.encoder.encode(self.rule_texts, show_progress_bar=False)
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)  # inner-product (cosine after L2-norm)
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings.astype("float32"))

    def _extract_rule_texts(self, content: Any, source: str, prefix: str = ""):
        """Recursively pull every meaningful string from the JSON rule files."""
        if isinstance(content, dict):
            for k, v in content.items():
                new_prefix = f"{prefix}.{k}" if prefix else k
                if isinstance(v, (dict, list)):
                    self._extract_rule_texts(v, source, new_prefix)
                elif isinstance(v, str) and len(v.split()) > 3:
                    self.rule_texts.append(v)
                    self.rule_metadata.append({"source": source, "path": new_prefix})
        elif isinstance(content, list):
            for i, item in enumerate(content):
                new_prefix = f"{prefix}[{i}]"
                if isinstance(item, (dict, list)):
                    self._extract_rule_texts(item, source, new_prefix)
                elif isinstance(item, str) and len(item.split()) > 3:
                    self.rule_texts.append(item)
                    self.rule_metadata.append({"source": source, "path": new_prefix})

    # ── Semantic search ───────────────────────────────────────

    def find_relevant_rules(self, text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """Semantic search: encode document chunks -> query FAISS -> return top-k matches."""
        if not self.encoder or not self.index:
            return []
        chunks = [text[i : i + 512] for i in range(0, min(len(text), 4096), 512)]
        query_embeddings = self.encoder.encode(chunks, show_progress_bar=False)
        faiss.normalize_L2(query_embeddings)

        relevant = []
        seen = set()
        for qe in query_embeddings:
            D, I = self.index.search(qe.reshape(1, -1).astype("float32"), k=top_k)
            for rank, idx in enumerate(I[0]):
                if idx < 0 or idx >= len(self.rule_texts):
                    continue
                key = (self.rule_metadata[idx]["source"], self.rule_metadata[idx]["path"])
                if key not in seen:
                    seen.add(key)
                    relevant.append({
                        "text": self.rule_texts[idx],
                        "source": self.rule_metadata[idx]["source"],
                        "path": self.rule_metadata[idx]["path"],
                        "similarity": round(float(D[0][rank]), 4),
                    })
        relevant.sort(key=lambda x: x["similarity"], reverse=True)
        return relevant[:top_k]

    # ── Entity extraction ─────────────────────────────────────

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """NER via spaCy (fallback to regex)."""
        entities: Dict[str, List[str]] = {"ORG": [], "LOC": [], "PERSON": [], "MONEY": []}
        if self.nlp:
            doc = self.nlp(text[:50000])
            for ent in doc.ents:
                if ent.label_ in entities:
                    entities[ent.label_].append(ent.text)
            entities = {k: list(dict.fromkeys(v)) for k, v in entities.items()}
        else:
            entities["MONEY"] = re.findall(r"QAR\s*[\d,]+", text)
        return entities

    # ── Main analysis ─────────────────────────────────────────

    def analyze_document(self, doc_text: str, doc_type: str) -> Dict[str, Any]:
        """Full analysis: NER + semantic search + rule-based checks."""
        gaps = []
        annotations = []
        missing_requirements = []

        entities = self.extract_entities(doc_text)
        relevant_rules = self.find_relevant_rules(doc_text)

        if doc_type == "business_plan":
            self._check_business_plan(doc_text, gaps, annotations, missing_requirements)
        elif doc_type == "data_privacy":
            self._check_data_privacy(doc_text, gaps, annotations, missing_requirements)
        elif doc_type == "articles_of_association":
            self._check_articles(doc_text, gaps, annotations, missing_requirements)

        score = self._calculate_score(gaps)
        resources = self._get_relevant_resources(gaps)

        return {
            "score": score,
            "gaps": [{**gap, "document_type": doc_type} for gap in gaps],
            "resources": resources,
            "annotations": annotations,
            "missing_requirements": missing_requirements,
            "entities": entities,
            "relevant_rules": relevant_rules,
        }

    # ── Business Plan Checks ──────────────────────────────────
    def _check_business_plan(self, text: str, gaps: list, annotations: list, missing: list):
        # 1. Risk Assessment
        if not re.search(r"risk\s+assessment|risk\s+analysis|risk\s+management\s+framework", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Risk Management",
                "description": "Missing risk assessment section. A comprehensive risk management framework is required.",
                "article": "General",
                "improvement": "Your business plan must detail the risk assessment framework including operational, credit, and compliance risks.",
            })
            missing.append("Risk Assessment / Risk Management Framework")

        # 2. AML/KYC
        if not re.search(r"anti.?money\s*launder|AML|KYC|know\s*your\s*customer|customer\s*due\s*diligence", text, re.I):
            gaps.append({
                "severity": "critical",
                "category": "AML/CFT Compliance",
                "description": "No mention of AML/KYC procedures found in the business plan.",
                "article": "1.1.1",
                "improvement": "The business plan must outline AML/KYC procedures including Enhanced CDD for users transacting over QAR 10,000/month (Article 1.1.1).",
            })
            missing.append("AML/KYC Procedures")
        else:
            if not re.search(r"enhanced\s*(CDD|customer\s*due\s*diligence)|QAR\s*10[,.]?000", text, re.I):
                gaps.append({
                    "severity": "high",
                    "category": "AML/CFT Compliance",
                    "description": "The business plan mentions KYC but does not specify enhanced CDD for users transacting over QAR 10,000 per month.",
                    "article": "1.1.1",
                    "improvement": "Your AML policy must detail Enhanced CDD procedures for any user transacting more than QAR 10,000 per month (Article 1.1.1).",
                })

        # 3. Board-approved AML/CFT policy
        if not re.search(r"board.{0,20}approv.{0,30}(AML|anti.?money|CFT)", text, re.I):
            gaps.append({
                "severity": "critical",
                "category": "AML/CFT Compliance",
                "description": "No board-approved AML/CFT policy is referenced in the business plan.",
                "article": "1.1.4",
                "improvement": "A comprehensive, Board-approved AML/CFT Policy must be submitted outlining transaction monitoring rules (Article 1.1.4).",
            })
            missing.append("Board-Approved AML/CFT Policy")

        # 4. Transaction monitoring
        if not re.search(r"transaction\s*monitor|automated\s*monitor|suspicious\s*activity\s*detect", text, re.I):
            gaps.append({
                "severity": "critical",
                "category": "AML/CFT Compliance",
                "description": "No mention of an automated transaction monitoring system capable of flagging suspicious activity.",
                "article": "1.2.1",
                "improvement": "Your policy must detail the automated transaction monitoring system you will deploy, including how it identifies suspicious patterns, velocity, and deviations (Article 1.2.1).",
            })
            missing.append("Automated Transaction Monitoring System")

        # 5. Capital requirements
        capital_match = re.search(r"(?:capital|paid.?up)\s*(?:of)?\s*QAR\s*([\d,]+)", text, re.I)
        if capital_match:
            amount_str = capital_match.group(1).replace(",", "")
            try:
                amount = int(amount_str)
                if re.search(r"P2P|peer.?to.?peer|marketplace\s*lending|crowdfund", text, re.I):
                    if amount < 7500000:
                        shortfall = 7500000 - amount
                        gaps.append({
                            "severity": "critical",
                            "category": "Capital Adequacy",
                            "description": f"Financial Deficiency. The paid-up capital of QAR {amount:,} is QAR {shortfall:,} short of the required minimum of QAR 7,500,000 for a Category 2 (Marketplace Lending) license.",
                            "article": "1.2.2",
                            "improvement": f"The business plan must state and evidence a minimum regulatory capital of QAR 7,500,000 for a Category 2 (P2P) license (Article 1.2.2).",
                        })
                        annotations.append((
                            capital_match.group(0),
                            f"Capital shortfall of QAR {shortfall:,} — minimum QAR 7,500,000 required for Category 2",
                        ))
            except ValueError:
                pass
        else:
            gaps.append({
                "severity": "high",
                "category": "Capital Adequacy",
                "description": "No capital amount specified in the business plan.",
                "article": "1.2",
                "improvement": "The business plan must clearly state the regulatory capital amount. See Article 1.2 for category-specific requirements.",
            })
            missing.append("Regulatory Capital Disclosure")

        # 6. Compliance Officer
        if not re.search(r"compliance\s*officer|chief\s*compliance|CCO", text, re.I):
            gaps.append({
                "severity": "critical",
                "category": "Governance",
                "description": "No designated Compliance Officer mentioned in the business plan.",
                "article": "2.2.1",
                "improvement": "The entity must appoint a designated, independent Compliance Officer whose CV must be submitted to QCB (Article 2.2.1).",
            })
            missing.append("Designated Compliance Officer")

        # 7. Source of funds
        if not re.search(r"source\s*of\s*funds|source\s*of\s*wealth", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "AML/CFT Compliance",
                "description": "No mention of source of funds verification procedures for high-risk or large transactions.",
                "article": "1.1.2",
                "improvement": "For transactions exceeding QAR 50,000, the entity must obtain and maintain source of funds and source of wealth documentation (Article 1.1.2).",
            })

    # ── Data Privacy Checks ───────────────────────────────────
    def _check_data_privacy(self, text: str, gaps: list, annotations: list, missing: list):
        text_lower = text.lower()

        # 1. Data Residency
        storage_match = re.search(
            r"(?:store|host|data\s+center|server|AWS|Azure|GCP|cloud).{0,80}(?:in|at|located|region)\s+([^.]{3,60})",
            text, re.I,
        )
        if storage_match:
            location = storage_match.group(1)
            if not re.search(r"qatar|doha", location, re.I):
                gaps.append({
                    "severity": "critical",
                    "category": "Data Residency",
                    "description": f"Data storage location ({location.strip()}) violates Qatar data localization laws. All PII and transactional data must be stored in Qatar.",
                    "article": "2.1.1",
                    "improvement": "Your policy must explicitly state that all PII and transactional data are stored on servers physically located within the State of Qatar (Article 2.1.1).",
                })
                annotations.append((
                    storage_match.group(0),
                    "QCB requires all customer data to be stored on servers physically in Qatar (Article 2.1.1)",
                ))
        elif not re.search(r"qatar|doha", text_lower):
            gaps.append({
                "severity": "critical",
                "category": "Data Residency",
                "description": "No mention of data storage location within Qatar. Data residency in Qatar is mandatory.",
                "article": "2.1.1",
                "improvement": "Your policy must explicitly state that all PII and transactional data are stored on servers physically located within the State of Qatar (Article 2.1.1).",
            })
            missing.append("Data Localization / Residency Commitment")

        # 2. Third-party consent
        if not re.search(r"(explicit|informed)\s*consent.{0,50}(third.?party|sharing|cloud)", text, re.I):
            gaps.append({
                "severity": "medium",
                "category": "Data Consent",
                "description": "No explicit consent mechanism for sharing data with third-party or cloud providers.",
                "article": "2.1.2",
                "improvement": "Explicit, informed consent must be obtained for sharing any data with third-party service providers including cloud providers (Article 2.1.2).",
            })
            missing.append("Explicit Third-Party Data Sharing Consent Mechanism")

        # 3. DPO
        if not re.search(r"data\s*privacy\s*officer|DPO", text, re.I):
            gaps.append({
                "severity": "critical",
                "category": "Governance",
                "description": "No Data Privacy Officer (DPO) mentioned.",
                "article": "4.4",
                "improvement": "A qualified DPO must be appointed and QCB must be notified with a Fit and Proper Form (Article 4.4).",
            })
            missing.append("Data Privacy Officer (DPO)")

        # 4. Data retention
        if not re.search(r"data\s*retention|retain.{0,30}(10\s*year|years)", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Data Retention",
                "description": "No data retention policy specifying minimum retention periods.",
                "article": "11.3",
                "improvement": "Must retain SFI for 10 years, Personal Data/PII/SPI for 10 years, Technical Information for 1 year (Article 11.3).",
            })
            missing.append("Data Retention Policy")

        # 5. Data classification
        if not re.search(r"(data\s*classif|SPI|SFI|sensitive\s*personal|sensitive\s*financial)", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Data Classification",
                "description": "No data classification framework for sensitive information.",
                "article": "7.3",
                "improvement": "SPI and SFI must be classified at the highest, most strict classification level (Article 7.3).",
            })

        # 6. Customer data rights
        if not re.search(r"(right\s*to\s*(access|erasure|deletion|correction)|data\s*portability|machine.?readable)", text, re.I):
            gaps.append({
                "severity": "medium",
                "category": "Customer Rights",
                "description": "No customer data rights framework (access, correction, deletion, portability).",
                "article": "14.4",
                "improvement": "Customers must be able to access, correct, and delete their data, and receive it in machine-readable format (Article 14.4).",
            })
            missing.append("Customer Data Rights Framework")

        # 7. External Privacy Policy
        if not re.search(r"(publish|public).{0,30}privacy\s*policy|external\s*privacy", text, re.I):
            gaps.append({
                "severity": "medium",
                "category": "Privacy Policy",
                "description": "No mention of publishing an external privacy policy for customer transparency.",
                "article": "5.4",
                "improvement": "An External Privacy Policy must be published on externally hosted channels informing customers of their data rights (Article 5.4).",
            })

    # ── Articles of Association Checks ────────────────────────
    def _check_articles(self, text: str, gaps: list, annotations: list, missing: list):
        # 1. Sharia
        if not re.search(r"shari.?a\s*(compliance|board|advisory|governance)", text, re.I):
            gaps.append({
                "severity": "medium",
                "category": "Governance",
                "description": "No mention of Sharia compliance framework in the Articles of Association.",
                "article": "General",
                "improvement": "Consider including a Sharia compliance or advisory board framework if operating Islamic finance products.",
            })

        # 2. Board structure
        if not re.search(r"board\s*of\s*directors|board\s*composition|board\s*member", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Corporate Governance",
                "description": "No board of directors composition details found.",
                "article": "2.1.1",
                "improvement": "CVs, organizational charts, and police clearance for all Board Members, CEO, and Compliance Officer must be provided (Article 2.1.1).",
            })
            missing.append("Board of Directors Composition")

        # 3. Compliance officer
        if not re.search(r"compliance\s*officer|regulatory\s*officer", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Governance",
                "description": "No designated compliance officer role in corporate structure.",
                "article": "2.2.1",
                "improvement": "A designated, independent Compliance Officer must be appointed and their credentials submitted to QCB (Article 2.2.1).",
            })

        # 4. Capital structure
        if not re.search(r"(authoriz|paid.?up|share)\s*capital|capital\s*structure", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Capital Structure",
                "description": "No capital structure details found in Articles of Association.",
                "article": "1.2",
                "improvement": "Articles must detail the capital structure including authorized and paid-up capital amounts.",
            })
            missing.append("Capital Structure Details")

        # 5. Signed
        if not re.search(r"(signed|executed|notari|final)\s*(articles|document|agreement)", text, re.I):
            gaps.append({
                "severity": "high",
                "category": "Documentation",
                "description": "No indication the Articles of Association are final and signed.",
                "article": "2.1.2",
                "improvement": "The final, signed Articles of Association must be submitted before the Conditional License is issued (Article 2.1.2).",
            })

    # ── Scoring ───────────────────────────────────────────────
    def _calculate_score(self, gaps: List[Dict[str, Any]]) -> float:
        if not gaps:
            return 100.0
        weights = {"critical": 25, "high": 15, "medium": 8, "low": 3}
        total = sum(weights.get(g["severity"], 0) for g in gaps)
        return max(0, round(100 - total, 1))

    # ── Resources ─────────────────────────────────────────────
    def _get_relevant_resources(self, gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        resources = []
        seen = set()
        gap_categories = {g["category"].lower() for g in gaps}

        for prog in self.resources.get("qdb_programs", []):
            prog_keywords = [fa.lower() for fa in prog.get("focus_areas", [])]
            prog_gap_cats = [c.lower() for c in prog.get("gap_categories", [])]
            for gc in gap_categories:
                if any(kw in gc for kw in prog_gap_cats) or any(kw in gc for kw in prog_keywords):
                    key = prog["program_id"]
                    if key not in seen:
                        seen.add(key)
                        resources.append({
                            "name": prog["program_name"],
                            "type": "QDB Program",
                            "description": prog["description"],
                            "contact": prog.get("contact", ""),
                            "website": prog.get("website", ""),
                        })
                    break

        for expert in self.resources.get("compliance_experts", []):
            expert_cats = [c.lower() for c in expert.get("gap_categories", [])]
            for gc in gap_categories:
                if any(kw in gc for kw in expert_cats) or any(gc in ea.lower() for ea in expert.get("expertise_areas", [])):
                    key = expert["expert_id"]
                    if key not in seen:
                        seen.add(key)
                        resources.append({
                            "name": expert["name"],
                            "type": "Compliance Expert",
                            "description": expert["specialization"],
                            "contact": f"{expert.get('contact', '')} | {expert.get('phone', '')}",
                        })
                    break

        return resources
