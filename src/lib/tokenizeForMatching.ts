export function tokenizeForMatching(text: string): {
  tokens: string[];
  phrases: string[];
} {
  const normalizedWhitespace = text.toLowerCase().replace(/\s+/g, " ").trim();

  const punctuationReduced = normalizedWhitespace
    .replace(/["'`“”‘’]/g, "")
    .replace(/[!?,;:(){}\[\]|<>]/g, " ");

  const tokens = punctuationReduced
    .split(" ")
    .map((token) =>
      token
        .replace(/^[^a-z0-9+#./-]+|[^a-z0-9+#./-]+$/g, "")
        .replace(/^\.+|\.+$/g, ""),
    )
    .filter((token) => token.length > 0 && /[a-z0-9]/.test(token));

  const phrases: string[] = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    phrases.push(`${tokens[index]} ${tokens[index + 1]}`);
  }

  return { tokens, phrases };
}
