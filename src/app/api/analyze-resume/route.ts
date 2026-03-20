import { NextResponse } from "next/server";
import { skillDictionary } from "../../../data/skills/skills";
import { buildJobDescriptionPreprocessedData } from "../../../lib/buildJobDescriptionPreprocessedData";
import { buildResumePreprocessedData } from "../../../lib/buildResumePreprocessedData";
import { calculateAchievementScore } from "../../../lib/calculateAchievementScore";
import { calculateExperienceAlignmentScore } from "../../../lib/calculateExperienceAlignmentScore";
import { calculateKeywordCoverageScore } from "../../../lib/calculateKeywordCoverageScore";
import { calculateSkillMatchScore } from "../../../lib/calculateSkillMatchScore";
import { calculateStructureScore } from "../../../lib/calculateStructureScore";
import { calculateWeightedAtsScore } from "../../../lib/calculateWeightedAtsScore";
import { cleanResumeText } from "../../../lib/cleanResumeText";
import { extractPdfText } from "../../../lib/extractPdfText";
import { extractSkillsFromText } from "../../../lib/extractSkillsFromText";
import { matchSkills } from "../../../lib/matchSkills";
import { normalizeJobDescription } from "../../../lib/normalizeJobDescription";
import { refineResumeText } from "../../../lib/refineResumeText";
import { refineSkillResults } from "../../../lib/refineSkillResults";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const resumeFile = formData.get("resume");
    const jobDescriptionValue = formData.get("jobDescription");
    const jobDescription =
      typeof jobDescriptionValue === "string" ? jobDescriptionValue.trim() : "";

    if (!(resumeFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No resume file was uploaded.",
        },
        { status: 400 },
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawResumeText = await extractPdfText(buffer);
    const cleanedResumeText = cleanResumeText(rawResumeText);
    const refinedResumeText = refineResumeText(cleanedResumeText);
    const resumePreprocessedData = buildResumePreprocessedData(
      rawResumeText,
      refinedResumeText,
    );

    const normalizedJobDescription = normalizeJobDescription(jobDescription);
    const jdPreprocessedData = buildJobDescriptionPreprocessedData(
      jobDescription,
      normalizedJobDescription,
    );

    const resumeSkills = extractSkillsFromText(
      resumePreprocessedData,
      skillDictionary,
    );
    const jdSkills = extractSkillsFromText(jdPreprocessedData, skillDictionary);

    const { matchedSkills, missingSkills, extraSkills } = matchSkills(
      resumeSkills,
      jdSkills,
    );

    const refinedMatchedSkills = refineSkillResults(
      matchedSkills,
      skillDictionary,
    );
    const refinedMissingSkills = refineSkillResults(
      missingSkills,
      skillDictionary,
    );
    const refinedExtraSkills = refineSkillResults(extraSkills, skillDictionary);

    const skillMatchScore = calculateSkillMatchScore({
      matchedSkillsCount: matchedSkills.length,
      totalJdSkillsCount: jdSkills.length,
    });

    const keywordCoverageResult = calculateKeywordCoverageScore({
      resumeText: refinedResumeText,
      jobDescriptionText: normalizedJobDescription,
    });

    const experienceAlignmentResult = calculateExperienceAlignmentScore({
      resumeText: refinedResumeText,
      jobDescriptionText: normalizedJobDescription,
    });

    const structureResult = calculateStructureScore({
      resumeText: refinedResumeText,
    });

    const achievementResult = calculateAchievementScore({
      resumeText: refinedResumeText,
    });

    const weightedScoreResult = calculateWeightedAtsScore({
      skillMatchScore,
      keywordCoverageScore: keywordCoverageResult.score,
      experienceAlignmentScore: experienceAlignmentResult.score,
      structureScore: structureResult.score,
      achievementScore: achievementResult.score,
    });

    const wordCount = normalizedJobDescription.split(/\s+/).length;

    const hasMeaningfulJobRequirements =
      wordCount >= 5 &&
      (jdSkills.length >= 1 ||
        keywordCoverageResult.consideredKeywords.length >= 2);

    const scoreBreakdown = hasMeaningfulJobRequirements
      ? {
          skillMatchScore,
          keywordCoverageScore: keywordCoverageResult.score,
          experienceAlignmentScore: experienceAlignmentResult.score,
          structureScore: structureResult.score,
          achievementScore: achievementResult.score,
        }
      : {
          skillMatchScore: 0,
          keywordCoverageScore: 0,
          experienceAlignmentScore: 0,
          structureScore: 0,
          achievementScore: 0,
        };

    const finalScore = hasMeaningfulJobRequirements
      ? weightedScoreResult.finalScore
      : 0;

    return NextResponse.json({
      success: true,
      finalScore,
      jobDescriptionQuality: {
        hasMeaningfulRequirements: hasMeaningfulJobRequirements,
      },
      scoreBreakdown,
      scoreDetails: {
        experienceAlignment: {
          detectedResumeLevel: experienceAlignmentResult.detectedResumeLevel,
          detectedJobLevel: experienceAlignmentResult.detectedJobLevel,
          reasoning: experienceAlignmentResult.reasoning,
        },
        structure: {
          detectedSections: structureResult.detectedSections,
          bulletCount: structureResult.bulletCount,
          reasoning: structureResult.reasoning,
        },
        achievement: {
          numericSignalCount: achievementResult.numericSignalCount,
          actionSignalCount: achievementResult.actionSignalCount,
          reasoning: achievementResult.reasoning,
        },
      },
      matchedSkills: refinedMatchedSkills,
      missingSkills: refinedMissingSkills,
      extraSkills: refinedExtraSkills,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to analyze the resume and job description.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
