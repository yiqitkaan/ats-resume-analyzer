import OpenAI from "openai";

type ExplanationInput = {
  overallSummary: string;
  strengths: string[];
  mainGaps: string[];
  suggestedImprovements: string[];
};

type ExplanationOutput = {
  improvedSummary: string;
  improvedStrengths: string[];
  improvedGaps: string[];
  improvedSuggestions: string[];
};

function buildFallback(explanation: ExplanationInput): ExplanationOutput {
  return {
    improvedSummary: explanation.overallSummary,
    improvedStrengths: explanation.strengths,
    improvedGaps: explanation.mainGaps,
    improvedSuggestions: explanation.suggestedImprovements,
  };
}

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}\n\n[TRUNCATED]`;
}

function getSkillExamples(skills: Array<{ name: string }>, limit = 5): string[] {
  return skills
    .map((skill) => skill.name.trim())
    .filter((name) => name.length > 0)
    .slice(0, limit);
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with fallback parsing.
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      // Continue with fallback parsing.
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function hasPlaceholder(text: string): boolean {
  return /\{\{.*?\}\}/.test(text);
}

function normalizeAndValidateList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const trimmedItems = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
    .filter((item) => !hasPlaceholder(item))
    .filter((item) => !item.includes("```"));

  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const item of trimmedItems) {
    const key = item.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(item);
  }

  if (deduped.length < 2 || deduped.length > 5) {
    return null;
  }

  return deduped;
}

function validateOutputShape(value: unknown): ExplanationOutput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const { improvedSummary, improvedStrengths, improvedGaps, improvedSuggestions } =
    candidate;

  if (typeof improvedSummary !== "string") {
    return null;
  }

  const normalizedSummary = improvedSummary.trim();
  if (
    normalizedSummary.length === 0 ||
    hasPlaceholder(normalizedSummary) ||
    normalizedSummary.includes("```")
  ) {
    return null;
  }

  const normalizedStrengths = normalizeAndValidateList(improvedStrengths);
  const normalizedGaps = normalizeAndValidateList(improvedGaps);
  const normalizedSuggestions = normalizeAndValidateList(improvedSuggestions);

  if (!normalizedStrengths || !normalizedGaps || !normalizedSuggestions) {
    return null;
  }

  return {
    improvedSummary: normalizedSummary,
    improvedStrengths: normalizedStrengths,
    improvedGaps: normalizedGaps,
    improvedSuggestions: normalizedSuggestions,
  };
}

export async function enhanceExplanationWithAI(params: {
  finalScore: number;
  refinedResumeText: string;
  normalizedJobDescription: string;
  explanation: {
    overallSummary: string;
    strengths: string[];
    mainGaps: string[];
    suggestedImprovements: string[];
  };
  matchedSkills: Array<{ name: string }>;
  missingSkills: Array<{ name: string }>;
}): Promise<{
  improvedSummary: string;
  improvedStrengths: string[];
  improvedGaps: string[];
  improvedSuggestions: string[];
}> {
  const fallback = buildFallback(params.explanation);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallback;
  }

  try {
    const client = new OpenAI({ apiKey });
    const matchedSkillExamples = getSkillExamples(params.matchedSkills, 5);
    const missingSkillExamples = getSkillExamples(params.missingSkills, 5);

    const systemPrompt = `
You are a professional resume analyst and writing expert.

Your role is NOT to generate new insights.
Your role is to REWRITE and IMPROVE existing Resume Analysis Insights.

CORE BEHAVIOR (CRITICAL):
- You MUST rewrite every sentence.
- You MUST NOT reuse the same wording or sentence structures.
- You MUST NOT copy phrases directly from the input.
- You MUST transform rigid, mechanical sentences into natural, professional language.
- Output must feel like written by a human career advisor.

WRITING QUALITY RULES:
- Improve clarity, flow, and readability.
- Replace robotic phrasing with natural, smooth language.
- Use a professional but slightly conversational tone.
- Avoid template-like phrasing.
- Avoid generic constructions like:
  "X includes Y", "X shows Y", "X demonstrates Y"

STRICT VARIATION RULES (HARD CONSTRAINTS):
- You MUST NOT start more than one sentence with the same word.
- You MUST NOT start sentences with:
  "The resume", "The candidate", "The alignment", "The job description"
- If such patterns appear, you MUST rewrite them.
- Each sentence MUST have a different opening structure.
- Sentence variety is REQUIRED.
- Repetitive sentence openings make the output INVALID.

NATURAL LANGUAGE GUIDELINES:
- Prefer varied openings such as:
  "With..."
  "Given..."
  "Because..."
  "Overall..."
  "Areas such as..."
  "Skills like..."
  "A key gap is..."
  "Another limitation is..."
  "One noticeable strength is..."
  "There is limited..."
- Use action-oriented phrasing instead of passive descriptions.

STRICT CONTENT CONSTRAINTS:
- Do NOT invent skills.
- Do NOT invent work experience.
- Do NOT invent achievements, metrics, or numbers.
- Do NOT contradict ATS findings.
- Do NOT remove meaning.
- Do NOT add new information.

FORMAT RULES:
- Return valid JSON only.
- No markdown.
- No code fences.
- No placeholders like {{...}}.
- No extra text outside JSON.

OUTPUT MUST MATCH EXACTLY:
{
  "improvedSummary": "string",
  "improvedStrengths": ["string", "string"],
  "improvedGaps": ["string", "string"],
  "improvedSuggestions": ["string", "string"]
}
`.trim();

    const userPrompt = `
IMPORTANT INSTRUCTIONS:

1. FULL REWRITE REQUIRED
- Do NOT reuse original sentences
- Do NOT keep original phrasing
- Every sentence must be improved and rewritten

2. PRESERVE MEANING EXACTLY
- Do not change conclusions
- Do not add or remove insights
- Do not introduce new facts

3. WRITING QUALITY
- Make sentences smooth and natural
- Avoid robotic or template-like tone
- Use varied sentence structures
- Avoid repetitive phrasing

4. STRICT VARIATION RULE
- No two sentences should start the same way
- Avoid repeating sentence openings
- Each bullet must feel independently written

5. HUMAN-LIKE STYLE
- Output should feel like written by a human expert
- Avoid system-like or mechanical phrasing

6. CONCISENESS
- Each bullet = one clear sentence
- Keep it short but meaningful
- Lists must contain 2–5 items

7. FINAL SELF-CHECK (MANDATORY BEFORE OUTPUT)
- No repeated sentence openings
- No "The ..." pattern repetition
- All sentences sound natural and non-robotic

--------------------------------------------------

INPUT DATA:

FINAL SCORE:
${params.finalScore}

MATCHED SKILLS:
${JSON.stringify(matchedSkillExamples)}

MISSING SKILLS:
${JSON.stringify(missingSkillExamples)}

JOB DESCRIPTION:
${truncateText(params.normalizedJobDescription, 1600)}

RESUME TEXT:
${truncateText(params.refinedResumeText, 2500)}

RULE-BASED INSIGHTS:
${JSON.stringify(params.explanation, null, 2)}

--------------------------------------------------

TASK:

Rewrite the Resume Analysis Insights with clearly improved wording.

DO NOT:
- reuse original sentences
- copy phrases directly
- keep robotic tone

DO:
- make it smoother
- make it more natural
- make it more readable
- keep it faithful

Return JSON only.
`.trim();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_output_tokens: 350,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const content =
      typeof response.output_text === "string" ? response.output_text : "";
    if (content.trim().length === 0) {
      return fallback;
    }

    const parsed = parseJsonObject(content);
    const validated = validateOutputShape(parsed);

    return validated ?? fallback;
  } catch {
    return fallback;
  }
}
