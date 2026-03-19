import { NextResponse } from "next/server";
import { extractPdfText } from "../../../lib/extractPdfText";
import { cleanResumeText } from "../../../lib/cleanResumeText";
import { refineResumeText } from "../../../lib/refineResumeText";

export const runtime = "nodejs";

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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to parse the uploaded resume.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
