import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set. Copy .env.example to .env and add a key from https://aistudio.google.com/apikey");
  client ??= new GoogleGenAI({ apiKey: key });
  return client;
}

export interface GeminiRequest {
  systemInstruction: string;
  prompt: string;
  // Standard JSON Schema (lowercase types). See schemas.ts.
  responseSchema: unknown;
}

// Free-tier Gemini frequently returns 503/429 under load; retry with backoff.
const MAX_ATTEMPTS = 4;
const RETRYABLE = /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|fetch failed|ECONNRESET|ETIMEDOUT/i;

export async function geminiJSON<T>(req: GeminiRequest): Promise<T> {
  const ai = getClient();
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: req.prompt,
        config: {
          systemInstruction: req.systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: req.responseSchema,
          temperature: 0.4,
        },
      });
      const text = res.text;
      if (!text) throw new Error("Gemini returned empty response");
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new Error(`Gemini returned non-JSON: ${text.slice(0, 200)}…`);
      }
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === MAX_ATTEMPTS || !RETRYABLE.test(msg)) throw err;
      const delay = 2000 * 2 ** (attempt - 1) + Math.random() * 500;
      console.warn(`[gemini] attempt ${attempt}/${MAX_ATTEMPTS} failed (${msg.slice(0, 80)}…) — retrying in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
