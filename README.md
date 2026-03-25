# ATS Resume Analyzer

A full-stack ATS-style resume analysis application built with **Next.js**, **TypeScript**, and a **hybrid rule-based + AI-enhanced insights pipeline**.

The application lets a user upload a PDF resume, paste a job description, and receive:

- ATS-style overall score
- Multi-factor score breakdown
- Matched / missing / additional skills
- Resume Analysis Insights enhanced by AI
- A polished, portfolio-ready results dashboard

---

## Demo

[Watch the demo video](docs/demo/AtsResumeAnalyzerDemo.mp4)

---

## Project Overview

This project simulates how a modern Applicant Tracking System (ATS) evaluates a resume against a job description.

Instead of relying on a single score, the system combines multiple analysis layers:

- **Skill matching** between resume and job description
- **Keyword coverage** analysis
- **Experience alignment** detection
- **Resume structure** scoring
- **Achievement signal** scoring
- **AI-enhanced Resume Analysis Insights** built on top of rule-based findings

The core ATS engine remains deterministic and explainable, while AI is used in a controlled way only to improve the wording and readability of the final insights.

---

## Problem, Motivation, and Solution

This project started from a real hiring problem I observed during internship applications.

Many companies do not evaluate every CV manually at the first stage.  
Instead, resumes are filtered by ATS systems before a recruiter reviews them.

That created a clear problem for me:
- I needed to understand why a CV is accepted or rejected by ATS filters
- I needed a practical way to improve my resume based on measurable signals

So I built my own ATS-style analysis system as a direct solution:
- It compares a resume against a target job description
- It produces explainable score components (skills, keywords, structure, experience, achievement)
- It highlights matched and missing areas

Then I strengthened the system with AI:
- Rule-based analysis remains the source of truth
- AI is used to rewrite insights in a clearer, more human-readable way
- Safety constraints prevent hallucinated or fabricated claims

In short, this project was built to solve a real applicant-side problem with an engineering-first approach:  
understand ATS behavior, improve resume quality, and increase interview readiness with structured, explainable feedback.

---

## Features

### 1. Resume Upload & Input Flow
- Upload resume in PDF format
- Paste target job description
- Client-side form validation
- Reset behavior when file or job description changes

### 2. Resume Parsing Pipeline
- PDF text extraction on the backend
- Resume text cleaning and normalization
- Refined resume text preparation for downstream analysis

### 3. ATS Analysis Engine
- Skill extraction from both resume and job description
- Matched / missing / additional skill detection
- Detailed ATS scoring pipeline:
  - Skill Match Score
  - Keyword Coverage Score
  - Experience Alignment Score
  - Structure Score
  - Achievement Score
- Weighted final ATS score calculation

### 4. Resume Analysis Insights By AI
- Rule-based explanation engine generates:
  - Overall summary
  - Strengths
  - Main gaps
  - Suggested improvements
- OpenAI rewrites these insights into more natural, human-readable content
- Strict guardrails prevent hallucinated content
- Safe fallback to rule-based explanation if AI fails

### 5. Results Dashboard
- Clear ATS score visualization
- Score breakdown cards
- Matched / missing / extra skills panels
- AI-enhanced insights section
- Dark theme UI with subtle background glow effects
- Loading shimmer effect on analyze button
- Styled dark scrollbars for better visual consistency

### 6. Security & Stability Improvements
- PDF type validation
- File size limit validation
- Empty file protection
- Job description server-side length limit
- Generic server error responses to reduce internal error leakage
- Environment variables kept out of source control

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js Route Handlers
- Node.js runtime for server-side PDF parsing
- `pdf-parse`

### AI Layer
- OpenAI API
- `gpt-4o-mini`

---

## How It Works

### Step 1 — User Input
The user uploads a PDF resume and pastes a target job description.

### Step 2 — Resume Parsing
The backend extracts raw text from the uploaded PDF, then cleans and refines it for analysis.

### Step 3 — Preprocessing
The resume text and the job description are normalized and transformed into preprocessing models.

### Step 4 — Skill & Signal Analysis
The system extracts skills and calculates ATS-relevant signals such as keyword coverage, experience level alignment, structure quality, and achievement indicators.

### Step 5 — Weighted ATS Scoring
All scoring dimensions are combined into a weighted final ATS score.

### Step 6 — Rule-Based Explanation
The backend generates structured explanation content based on the score breakdown and skill analysis.

### Step 7 — AI Refinement
The rule-based explanation, along with the resume text and job description, is sent to OpenAI.
AI rewrites the insights to sound more natural and professional while preserving meaning and factual accuracy.

### Step 8 — Results UI
The frontend displays the final ATS dashboard and the AI-enhanced Resume Analysis Insights section.

---

## Architecture Summary

This project uses a layered design:

### Core Layer — Rule-Based ATS Engine
Responsible for:
- text preprocessing
- skill extraction
- score calculation
- explanation generation

This layer is deterministic, testable, and acts as the **source of truth**.

### AI Layer — Insight Refinement
Responsible for:
- rewriting rule-based insights
- improving clarity and readability
- preserving original analysis meaning

This layer does **not** generate new analysis and does **not** affect ATS scoring.

---

## Current Project Status

### Completed
- PDF upload and form validation
- Resume parsing pipeline
- Text cleaning and preprocessing
- Skill extraction and matching
- Multi-factor ATS scoring engine
- Rule-based explanation engine
- AI-enhanced Resume Analysis Insights
- Results dashboard UI and UX polish
- Security hardening and safer API behavior

### Final Product State
- End-to-end working ATS analysis flow
- Deterministic scoring core
- Safe AI refinement layer
- Portfolio-ready UI and architecture

---

## Project Phases

This project was built phase by phase.

For full phase notes and detailed implementation records, see:
- [docs/](docs/)
- [Phase 6 details](docs/phase6-details.txt)
- [Phase 7 details](docs/phase7-details.txt)

---

## Folder Structure

```bash
ats-resume-analyzer/
├── docs/
│   ├── demo/
│   ├── phase6-details.txt
│   └── phase7-details.txt
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-resume/
│   │   │   └── parse-resume/
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── types/
├── package.json
├── tsconfig.json
└── README.md
```

---

## Running Locally

Install dependencies:

```bash
npm install
```

Create your environment file manually:

```bash
touch .env.local
```

Add your own OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## Security Notes

- You must use your own OpenAI API key.
- Never commit `.env.local` or any file containing secrets.
- If a key is exposed by mistake, rotate/revoke it immediately from your OpenAI dashboard.
- Before pushing to GitHub, verify secrets are not tracked:

```bash
git status
git ls-files | grep -E "\\.env|secret|key"
```

---

## Notes About AI Behavior

The AI layer is intentionally constrained.

It is designed to:
- rewrite existing insights
- improve clarity and wording
- preserve ATS findings

It is **not** designed to:
- invent new skills
- invent new work experience
- generate fake achievements
- replace the rule-based ATS engine

This makes the project safer, more explainable, and more reliable as a portfolio piece.

---

## Why This Project Matters

This project demonstrates practical engineering across multiple layers:

- frontend UI/UX
- backend API design
- file handling
- text preprocessing
- rule-based scoring logic
- controlled AI integration
- validation, fallback, and security hardening

It is designed not just as a UI demo, but as a realistic portfolio project showing how deterministic systems and AI can work together safely.

---

## Author

**Yiğit Kaan Bilir**

LinkedIn: [yiğit-kaan-bilir-902698326](https://www.linkedin.com/in/yi%C4%9Fit-kaan-bilir-902698326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app)
