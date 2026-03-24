import { NextResponse } from "next/server";
import { extractPdfText } from "../../../lib/extractPdfText";
import { cleanResumeText } from "../../../lib/cleanResumeText";
import { refineResumeText } from "../../../lib/refineResumeText";

export const runtime = "nodejs";

const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function isPdfFile(file: File): boolean {
  const normalizedName = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    normalizedName.endsWith(".pdf") ||
    file.type === "application/x-pdf"
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume");

    if (!(resumeFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No resume file was uploaded.",
        },
        { status: 400 },
      );
    }

    if (!isPdfFile(resumeFile)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF files are allowed.",
        },
        { status: 400 },
      );
    }

    if (resumeFile.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Uploaded resume file is empty.",
        },
        { status: 400 },
      );
    }

    if (resumeFile.size > MAX_RESUME_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume file is too large. Maximum allowed size is 10MB.",
        },
        { status: 413 },
      );
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rawText = await extractPdfText(buffer);
    const cleanedText = cleanResumeText(rawText);
    const refinedText = refineResumeText(cleanedText);

    return NextResponse.json({
      success: true,
      rawText,
      cleanedText,
      refinedText,
    });
  } catch (error: unknown) {
    console.error("[parse-resume] Unhandled error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse the uploaded resume.",
      },
      { status: 500 },
    );
  }
}
