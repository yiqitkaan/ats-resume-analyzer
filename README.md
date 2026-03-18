# ATS Resume Analyzer

A full-stack ATS-style resume analysis system built with Next.js and TypeScript.

This project analyzes a PDF resume against a job description and provides:

- Skill matching analysis (planned)
- Missing skills detection (planned)
- ATS-style scoring breakdown (planned)
- AI-powered improvement suggestions (planned)

---

## 🎯 Project Goal

The goal of this project is to simulate how modern Applicant Tracking Systems (ATS) evaluate resumes.

Users can:

1. Upload a resume in PDF format
2. Paste a job description
3. Receive structured analysis (coming in Phase 3+)

This project is designed as a portfolio-level engineering project demonstrating:

- Full-stack architecture
- Backend file handling
- Text normalization pipelines
- Rule-based scoring systems
- AI integration (planned)
- Clean and scalable project structure

---

# ✅ Current Status

## Phase 0 — Project Setup
- Next.js (App Router) initialized
- TypeScript configured
- Tailwind CSS configured
- Clean project structure created
- Git repository initialized and pushed

## Phase 1 — Upload & Form UI
- Resume PDF upload component
- File validation
- Job description input
- Controlled form state
- Client-side validation
- Clean UI layout
- Submit handling

## Phase 2 — PDF Parsing & Cleaning (Completed)

### What Was Implemented

- Backend API route (`/api/parse-resume`)
- Node runtime configuration
- PDF file → ArrayBuffer → Node Buffer conversion
- Server-side PDF text extraction
- Text cleaning & normalization layer
- Cleaned resume preview UI
- UX refinements (preview reset on file change)

### Architecture

PDF → rawText → cleanedText → Preview UI

- `extractPdfText.ts` handles PDF parsing
- `cleanResumeText.ts` handles normalization
- Route only manages request/response
- Frontend displays cleaned preview only

---

# 🐛 Debugging Notes (Important)

During Phase 2 integration, we encountered runtime errors when parsing PDFs.

### Issue

Initial attempts caused:

- 500 Internal Server Error
- Worker initialization failures
- Module resolution errors in Next.js environment

Example error:
> Setting up fake worker failed

### Root Cause

- Incorrect PDF library import usage
- Worker-related configuration conflicts in Next.js App Router environment
- Runtime mismatch (Edge vs Node)

### Solution

- Forced Node runtime in route:
  ```ts
  export const runtime = "nodejs";
  ```
- Removed incorrect default imports
- Removed experimental worker hacks
- Stabilized minimal `PDFParse` usage
- Isolated parsing logic into `src/lib/extractPdfText.ts`
- Cleaned all debug logs

Result:
Stable, server-side PDF parsing pipeline.

---

## 🛠 Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- pdf-parse (server-side parsing)
- OpenAI API (planned for later phases)

---

## 🧠 Architecture Overview

The system evolves in structured phases:

1. PDF Parsing Layer ✅
2. Text Normalization Layer ✅
3. Skill Extraction Engine (Next)
4. Match Engine
5. ATS Scoring System
6. AI Feedback Layer

Project phase documentation lives in:

```
docs/
```

---

## 🚀 Getting Started

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
ats-resume-analyzer/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── extractPdfText.ts
│   │   └── cleanResumeText.ts
│   ├── types/
│   └── data/
├── README.md
├── package.json
└── tsconfig.json
```

---

## 📌 Next Step

Phase 3 — Skill Extraction & ATS Matching Engine

---

## 👨‍💻 Author

Yiğit Kaan Bilir
