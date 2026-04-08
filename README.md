# Compliance Sentinel – Prototype
### Automated Regulatory Change Management Solution

**Compliance Sentinel** is an AI-driven platform designed for ** Banks** to automate the monitoring, analysis, and implementation of regulatory changes from bodies like **SBP (State Bank of )**, **FBR (Federal Board of Revenue)**, and **SECP**.

## Core Value Proposition
- **Automated Monitoring**: Ingests new circulars and notifications (e.g., SBP BPRD circulars) in real-time.
- **Internal Policy Gap Analysis**: Uses a **Vector Database (RAG)** to cross-reference new external regulations against the bank's *existing* internal policies and workflows.
- **AI Risk Analyst**: Providing a Chatbot interface and automated reports to identify compliance gaps and suggest specific workflow updates.

## Tech Stack (Hackathon Prototype)
- **Frontend**: Next.js 16 (React), Tailwind CSS, Recharts, Framer Motion.
- **Backend**: FastAPI (Python).
- **AI/ML**: RAG Pipeline (LangChain/LlamaIndex), Vector DB (Chroma/FAISS), OpenAI GPT-4o.
- **Data**: Synthetic Internal Policies vs. Public SBP/FBR Regulations.

## Workflow
1. **Ingest**: System scrapes/receives new regulation PDFs.
2. **Analyze**: AI compares regulation via Vector Search against Internal Policy documents.
3. **Alert**: Dashboard notifies Compliance Officer of specific gaps (e.g., "New SBP limit requires update to `Funds_Transfer_Policy.pdf`").
4. **Resolve**: User consults AI Chatbot for remediation steps.
