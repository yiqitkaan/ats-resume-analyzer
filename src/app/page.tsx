"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeJobDescription } from "../lib/normalizeJobDescription";
import type { ExtractedSkill } from "../lib/extractSkillsFromText";

type FormErrors = {
  pdf: string;
  jobDescription: string;
};

type ScoreBreakdown = {
  skillMatchScore: number;
  keywordCoverageScore: number;
  experienceAlignmentScore: number;
  structureScore: number;
  achievementScore: number;
};

type ScoreDetails = {
  experienceAlignment: {
    detectedResumeLevel: string | null;
    detectedJobLevel: string | null;
    reasoning: string;
  };
  structure: {
    detectedSections: string[];
    bulletCount: number;
    reasoning: string;
  };
  achievement: {
    numericSignalCount: number;
    actionSignalCount: number;
    reasoning: string;
  };
};

type AnalysisResult = {
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreDetails: ScoreDetails;
  matchedSkills: ExtractedSkill[];
  missingSkills: ExtractedSkill[];
  extraSkills: ExtractedSkill[];
};

type ScoreBarProps = {
  label: string;
  score: number;
  reasoning?: string;
};

function ScoreBar({ label, score, reasoning }: ScoreBarProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const fillColor = safeScore < 50 ? "bg-red-500" : "bg-green-500";

  return (
    <div className="rounded-lg border border-white/70 bg-slate-950/40 p-3">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-slate-200">{label}</p>
        <span className="font-semibold text-slate-300">%{safeScore}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${fillColor}`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
      {reasoning ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {reasoning}
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [, setNormalizedJobDescription] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [animatedScore, setAnimatedScore] = useState(0);
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

  useEffect(() => {
    if (!analysisResult) {
      setAnimatedScore(0);
      return;
    }

    const targetScore = analysisResult.finalScore;
    const duration = 800;
    const startTime = performance.now();
    let frameId = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setAnimatedScore(targetScore * progress);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [analysisResult]);

  const displayedScore = Math.max(0, Math.min(100, Math.round(animatedScore)));

  const getValidationErrors = (
    file: File | null,
    description: string,
  ): FormErrors => {
    return {
      pdf: file ? "" : "Please select a PDF resume.",
      jobDescription: description.trim()
        ? ""
        : "Please enter a job description.",
    };
  };

  const isFormValid = selectedFile !== null && jobDescription.trim().length > 0;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
    setSelectedFileName(file ? file.name : "");
    setAnalysisResult(null);
    setParseError("");
    setTouched((previous) => ({ ...previous, pdf: true }));
    setErrors(getValidationErrors(file ?? null, jobDescription));
  };

  const handleClearSelectedFile = () => {
    setSelectedFileName("");
    setSelectedFile(null);
    setAnalysisResult(null);
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

    const nextNormalizedJobDescription =
      normalizeJobDescription(jobDescription);
    setNormalizedJobDescription(nextNormalizedJobDescription);

    setParseError("");
    setAnalysisResult(null);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const errorMessage =
        typeof data?.error === "string"
          ? data.error
          : "Failed to connect to analyze route.";

      if (!response.ok || data?.success !== true) {
        throw new Error(errorMessage);
      }

      setAnalysisResult({
        finalScore: typeof data?.finalScore === "number" ? data.finalScore : 0,
        scoreBreakdown: {
          skillMatchScore:
            typeof data?.scoreBreakdown?.skillMatchScore === "number"
              ? data.scoreBreakdown.skillMatchScore
              : 0,
          keywordCoverageScore:
            typeof data?.scoreBreakdown?.keywordCoverageScore === "number"
              ? data.scoreBreakdown.keywordCoverageScore
              : 0,
          experienceAlignmentScore:
            typeof data?.scoreBreakdown?.experienceAlignmentScore === "number"
              ? data.scoreBreakdown.experienceAlignmentScore
              : 0,
          structureScore:
            typeof data?.scoreBreakdown?.structureScore === "number"
              ? data.scoreBreakdown.structureScore
              : 0,
          achievementScore:
            typeof data?.scoreBreakdown?.achievementScore === "number"
              ? data.scoreBreakdown.achievementScore
              : 0,
        },
        scoreDetails: {
          experienceAlignment: {
            detectedResumeLevel:
              typeof data?.scoreDetails?.experienceAlignment
                ?.detectedResumeLevel === "string"
                ? data.scoreDetails.experienceAlignment.detectedResumeLevel
                : null,
            detectedJobLevel:
              typeof data?.scoreDetails?.experienceAlignment
                ?.detectedJobLevel === "string"
                ? data.scoreDetails.experienceAlignment.detectedJobLevel
                : null,
            reasoning:
              typeof data?.scoreDetails?.experienceAlignment?.reasoning ===
              "string"
                ? data.scoreDetails.experienceAlignment.reasoning
                : "",
          },
          structure: {
            detectedSections: Array.isArray(
              data?.scoreDetails?.structure?.detectedSections,
            )
              ? data.scoreDetails.structure.detectedSections
              : [],
            bulletCount:
              typeof data?.scoreDetails?.structure?.bulletCount === "number"
                ? data.scoreDetails.structure.bulletCount
                : 0,
            reasoning:
              typeof data?.scoreDetails?.structure?.reasoning === "string"
                ? data.scoreDetails.structure.reasoning
                : "",
          },
          achievement: {
            numericSignalCount:
              typeof data?.scoreDetails?.achievement?.numericSignalCount ===
              "number"
                ? data.scoreDetails.achievement.numericSignalCount
                : 0,
            actionSignalCount:
              typeof data?.scoreDetails?.achievement?.actionSignalCount ===
              "number"
                ? data.scoreDetails.achievement.actionSignalCount
                : 0,
            reasoning:
              typeof data?.scoreDetails?.achievement?.reasoning === "string"
                ? data.scoreDetails.achievement.reasoning
                : "",
          },
        },
        matchedSkills: Array.isArray(data?.matchedSkills)
          ? data.matchedSkills
          : [],
        missingSkills: Array.isArray(data?.missingSkills)
          ? data.missingSkills
          : [],
        extraSkills: Array.isArray(data?.extraSkills) ? data.extraSkills : [],
      });
    } catch (error: unknown) {
      setAnalysisResult(null);
      setParseError(
        error instanceof Error
          ? error.message
          : "Failed to connect to analyze route.",
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
                  setAnalysisResult(null);
                  setParseError("");
                  setTouched((previous) => ({
                    ...previous,
                    jobDescription: true,
                  }));
                  setErrors(
                    getValidationErrors(selectedFile, nextJobDescription),
                  );
                }}
                maxLength={1500}
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
                {jobDescription.length} / 1500
              </p>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isParsing}
              className="mt-7 w-full rounded-xl border border-sky-200 bg-sky-200 px-5 py-3 text-base font-semibold text-sky-950 shadow-[0_10px_30px_-14px_rgba(125,211,252,0.95)] transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-sky-200"
            >
              {isParsing ? "Analyzing Resume..." : "Analyze Resume"}
            </button>

            {analysisResult && !parseError && !isParsing ? (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-slate-100">
                  ATS Analysis Result
                </h3>
                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                  <div className="order-2 space-y-3 lg:order-1">
                    <ScoreBar
                      label="Skill Match"
                      score={analysisResult.scoreBreakdown.skillMatchScore}
                    />
                    <ScoreBar
                      label="Experience"
                      score={
                        analysisResult.scoreBreakdown.experienceAlignmentScore
                      }
                      reasoning={
                        analysisResult.scoreDetails.experienceAlignment
                          .reasoning
                      }
                    />
                    <ScoreBar
                      label="Keyword Coverage"
                      score={analysisResult.scoreBreakdown.keywordCoverageScore}
                    />
                  </div>

                  <div className="order-1 flex flex-col items-center lg:order-2">
                    <div className="rounded-full border border-[#ffffff] p-1">
                      <div
                        className="relative h-40 w-40 rounded-full"
                        style={{
                          background: `conic-gradient(#16a34a ${displayedScore}%, #dc2626 ${displayedScore}% 100%)`,
                        }}
                      >
                        <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-slate-950">
                          <span
                            className={`text-3xl font-bold ${
                              displayedScore < 50
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            %{displayedScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-sm text-slate-400">
                      {analysisResult.matchedSkills.length} out of{" "}
                      {analysisResult.matchedSkills.length +
                        analysisResult.missingSkills.length}{" "}
                      job skills matched
                    </p>
                  </div>

                  <div className="order-3 space-y-3">
                    <ScoreBar
                      label="Structure"
                      score={analysisResult.scoreBreakdown.structureScore}
                      reasoning={
                        analysisResult.scoreDetails.structure.reasoning
                      }
                    />
                    <ScoreBar
                      label="Achievement"
                      score={analysisResult.scoreBreakdown.achievementScore}
                      reasoning={
                        analysisResult.scoreDetails.achievement.reasoning
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <p className="text-sm text-slate-400 max-w-2xl text-center">
                    Weights: Skill Match 50%, Keyword Coverage 15%, Experience
                    15%, Structure 10%, Achievement 10%
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-green-400">
                        Matched Skills
                      </h4>
                      <span className="rounded-full border border-green-500/50 bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-300">
                        {analysisResult.matchedSkills.length}
                      </span>
                    </div>
                    <div className="mt-3 flex h-[13.5rem] flex-wrap content-start gap-2 overflow-y-auto pr-1">
                      {analysisResult.matchedSkills.length > 0 ? (
                        analysisResult.matchedSkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full border border-green-500/50 px-2.5 py-1 text-xs font-medium text-green-300"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-green-200/80">
                          No matched skills.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-red-400">
                        Missing Skills
                      </h4>
                      <span className="rounded-full border border-red-500/50 bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
                        {analysisResult.missingSkills.length}
                      </span>
                    </div>
                    <div className="mt-3 flex h-[13.5rem] flex-wrap content-start gap-2 overflow-y-auto pr-1">
                      {analysisResult.missingSkills.length > 0 ? (
                        analysisResult.missingSkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full border border-red-500/50 px-2.5 py-1 text-xs font-medium text-red-300"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-red-200/80">
                          No missing skills.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-500/30 bg-slate-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-300">
                        Additional Skills
                      </h4>
                      <span className="rounded-full border border-slate-400/50 bg-slate-500/15 px-2 py-0.5 text-xs font-semibold text-slate-300">
                        {analysisResult.extraSkills.length}
                      </span>
                    </div>
                    <div className="mt-3 flex h-[13.5rem] flex-wrap content-start gap-2 overflow-y-auto pr-1">
                      {analysisResult.extraSkills.length > 0 ? (
                        analysisResult.extraSkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full border border-slate-400/50 px-2.5 py-1 text-xs font-medium text-slate-300"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-300/80">
                          No additional skills.
                        </p>
                      )}
                    </div>
                  </div>
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
