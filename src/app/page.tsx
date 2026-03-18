"use client";

import { useRef, useState } from "react";

type FormErrors = {
  pdf: string;
  jobDescription: string;
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [cleanedResumeText, setCleanedResumeText] = useState<string | null>(
    null,
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [touched, setTouched] = useState({
    pdf: false,
    jobDescription: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    pdf: "",
    jobDescription: "",
  });

  const getValidationErrors = (
    file: File | null,
    description: string,
  ): FormErrors => {
    return {
      pdf: file ? "" : "Please select a PDF resume.",
      jobDescription: description.trim() ? "" : "Please enter a job description.",
    };
  };

  const isFormValid = selectedFile !== null && jobDescription.trim().length > 0;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
    setSelectedFileName(file ? file.name : "");
    setCleanedResumeText(null);
    setParseError("");
    setTouched((previous) => ({ ...previous, pdf: true }));
    setErrors(getValidationErrors(file ?? null, jobDescription));
  };

  const handleClearSelectedFile = () => {
    setSelectedFileName("");
    setSelectedFile(null);
    setCleanedResumeText(null);
    setParseError("");
    setTouched((previous) => ({ ...previous, pdf: true }));
    setErrors(getValidationErrors(null, jobDescription));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ pdf: true, jobDescription: true });

    const nextErrors = getValidationErrors(selectedFile, jobDescription);
    setErrors(nextErrors);

    if (nextErrors.pdf || nextErrors.jobDescription) {
      return;
    }

    if (!selectedFile) {
      return;
    }

    setParseError("");
    setCleanedResumeText(null);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const errorMessage =
        typeof data?.error === "string"
          ? data.error
          : "Failed to connect to parse route.";

      if (!response.ok || data?.success !== true) {
        throw new Error(errorMessage);
      }

      if (typeof data.cleanedText === "string" && data.cleanedText.trim()) {
        setCleanedResumeText(data.cleanedText);
      } else {
        setCleanedResumeText(null);
      }
    } catch (error: unknown) {
      setCleanedResumeText(null);
      setParseError(
        error instanceof Error
          ? error.message
          : "Failed to connect to parse route.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8">
        <section className="space-y-4 text-center">
          <p className="mx-auto w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
            Portfolio Project
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            ATS Resume Analyzer
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Upload your resume and paste a job description to get an ATS-style
            analysis of match quality, missing skills, and feedback.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Analyzer Form
          </h2>

          <form onSubmit={handleSubmit} className="mt-5">
            <div>
              <label
                htmlFor="resumePdf"
                className="text-base font-semibold text-slate-100"
              >
                Resume PDF
              </label>

              <input
                id="resumePdf"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="sr-only"
              />

              <div className="relative mt-2">
                <label
                  htmlFor="resumePdf"
                  className={`flex cursor-pointer items-center justify-center rounded-xl border-[6px] px-4 py-8 text-center text-lg font-semibold transition-colors ${
                    selectedFile
                      ? "border-green-900 bg-green-100 text-green-900 hover:bg-green-200"
                      : "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                  title={
                    selectedFileName
                      ? `Selected File : ${selectedFileName}`
                      : "Upload PDF"
                  }
                >
                  {selectedFileName
                    ? `Selected File : ${selectedFileName}`
                    : "Upload PDF"}
                </label>

              {selectedFile ? (
                <button
                    type="button"
                    onClick={handleClearSelectedFile}
                    aria-label="Remove selected file"
                    className="absolute bottom-2 right-2 z-10 rounded-md bg-green-950 p-1.5 text-green-100 transition-colors hover:bg-green-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                ) : null}
              </div>

              {touched.pdf && errors.pdf ? (
                <p className="mt-2 text-sm text-red-300">{errors.pdf}</p>
              ) : null}
            </div>

            <div className="mt-6">
              <label
                htmlFor="jobDescription"
                className="text-base font-semibold text-slate-100"
              >
                Job Description
              </label>

              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(event) => {
                  const nextJobDescription = event.target.value;
                  setJobDescription(nextJobDescription);
                  setParseError("");
                  setTouched((previous) => ({
                    ...previous,
                    jobDescription: true,
                  }));
                  setErrors(getValidationErrors(selectedFile, nextJobDescription));
                }}
                maxLength={700}
                rows={8}
                placeholder="Paste the full job description here (responsibilities, requirements, and preferred skills)."
                className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400"
              />

              {touched.jobDescription && errors.jobDescription ? (
                <p className="mt-2 text-sm text-red-300">
                  {errors.jobDescription}
                </p>
              ) : null}

              <p className="mt-2 text-right text-xs text-slate-400">
                {jobDescription.length} / 700
              </p>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isParsing}
              className="mt-7 w-full rounded-xl border border-sky-200 bg-sky-200 px-5 py-3 text-base font-semibold text-sky-950 shadow-[0_10px_30px_-14px_rgba(125,211,252,0.95)] transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-sky-200"
            >
              {isParsing ? "Parsing Resume..." : "Analyze Resume"}
            </button>

            {cleanedResumeText ? (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-slate-100">
                  Extracted Resume Preview
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  This is the cleaned text extracted from your uploaded resume.
                </p>

                <div className="mt-3 h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
                  {cleanedResumeText}
                </div>
              </div>
            ) : null}

            {parseError ? (
              <p className="mt-3 text-sm text-red-300">{parseError}</p>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
