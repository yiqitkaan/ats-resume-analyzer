# ATS Resume Analyzer

A full-stack ATS-style resume analysis system built with Next.js and TypeScript.

This project analyzes a PDF resume against a job description and provides:

- Skill matching analysis
- Missing skills detection
- ATS-style scoring breakdown
- AI-powered improvement suggestions (planned)

---

## 🎯 Project Goal

The goal of this project is to simulate how Applicant Tracking Systems (ATS) evaluate resumes.

Users will be able to:

1. Upload a resume in PDF format
2. Paste a job description
3. Receive:
   - Matched skills
   - Missing skills
   - Score breakdown
   - Optimization feedback

This project is designed as a portfolio-level engineering project demonstrating:

- Full-stack development
- Text processing
- Rule-based scoring systems
- AI integration
- Clean project architecture

---

## 🛠 Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (planned)
- PDF parsing library (planned)

---

## 🧠 Architecture Overview (Planned)

The system will include:

1. PDF Parsing Layer  
2. Text Normalization Layer  
3. Skill Extraction Engine  
4. Match Engine  
5. ATS Scoring System  
6. AI Feedback Layer  

Each phase of development is tracked inside:

```
docs/project-phases.txt
```

---

## 🚀 Getting Started

Run the development server:

```
npm install
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
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── data/
├── README.md
├── package.json
└── tsconfig.json
```

---

## 📌 Status

Phase 0 — Project setup completed  
Next step: Build basic resume upload and analysis UI

---

## 👨‍💻 Author

Yiğit Kaan Bilir
