import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

// Inline DISC tells so this module is self-contained (server-fn splitting safe).
const STYLE_TELLS: Record<string, { name: string; tells: string[] }> = {
  d: {
    name: "Dominant",
    tells: [
      "Leads with the ask or outcome in the first sentence",
      "Short sentences, strong verbs, no hedging",
      "Offers 2-3 options with a clear recommendation",
      "Names the deadline or decision point up front",
      "Skips small talk; ends with a next step",
    ],
  },
  i: {
    name: "Influencer",
    tells: [
      "Opens with warmth, a name, or shared context",
      "Uses vivid language and emotion words",
      "Frames the ask as a story or a shared win",
      "Invites collaboration and asks for their take",
      "Ends with encouragement, not just a task",
    ],
  },
  s: {
    name: "Steady",
    tells: [
      "Acknowledges the person before the task",
      "Gives context and reason, not just direction",
      "Signals that support is available",
      "Sets a gentle pace with a clear but not urgent deadline",
      "Confirms understanding and invites questions",
    ],
  },
  c: {
    name: "Conscientious",
    tells: [
      "Leads with context: what, why, and what's already true",
      "Uses precise words, numbers, and named criteria",
      "Lays out steps or structure the reader can verify",
      "Anticipates questions and answers them in advance",
      "Ends with a clear next step and how you'll know it's done",
    ],
  },
};

const CoachInput = z.object({
  targetStyle: z.enum(["d", "i", "s", "c"]),
  message: z.string().min(1).max(4000),
  context: z.string().max(1000).optional(),
  mode: z.enum(["capstone", "rewriter"]).default("capstone"),
});

export interface CoachResult {
  ok: boolean;
  score: number; // 0-5, tells hit
  hits: string[]; // tells the message met
  misses: string[]; // tells the message did not meet
  feedback: string; // 2-4 sentences of coaching
  suggestion: string; // one rewrite tuned to the style
  error?: string;
}

export const coachMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CoachInput.parse(input))
  .handler(async ({ data }): Promise<CoachResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        ok: false,
        score: 0,
        hits: [],
        misses: [],
        feedback:
          "AI coaching is temporarily unavailable. Use the self-check rubric below to score your draft.",
        suggestion: "",
        error: "missing_key",
      };
    }

    const style = STYLE_TELLS[data.targetStyle];
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const system = `You are a warm, direct communication coach for people leaders.
You are evaluating a message the leader wrote for a reader whose default communication style is ${style.name}.

A message that lands with a ${style.name} reader shows these five tells:
${style.tells.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Score the message strictly. Only count a tell as "hit" if it is clearly present in the actual message text.
Be specific in feedback — quote a short phrase from the message when you point something out.
Write for an 8th-grade reading level. Friendly, clear, professional. Never robotic. No emojis.

Return ONLY a valid JSON object matching this shape:
{
  "hits": string[],   // exact tells from the list above that the message met
  "misses": string[], // exact tells from the list above that the message did NOT meet
  "feedback": string, // 2-4 sentences of specific coaching. Reference short quotes from the message.
  "suggestion": string // one rewrite of the message tuned for a ${style.name} reader. Keep it realistic and about the same length.
}`;

    const prompt = [
      data.context ? `Context about the reader: ${data.context}` : "",
      "",
      "The leader's message:",
      "```",
      data.message,
      "```",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const { text } = await generateText({
        model,
        system,
        prompt,
      });

      // Extract JSON — model may wrap in fences.
      const jsonText = extractJson(text);
      const parsed = JSON.parse(jsonText) as {
        hits?: string[];
        misses?: string[];
        feedback?: string;
        suggestion?: string;
      };

      const hits = Array.isArray(parsed.hits) ? parsed.hits.slice(0, 5) : [];
      const misses = Array.isArray(parsed.misses)
        ? parsed.misses.slice(0, 5)
        : [];

      return {
        ok: true,
        score: hits.length,
        hits,
        misses,
        feedback: (parsed.feedback ?? "").toString().trim(),
        suggestion: (parsed.suggestion ?? "").toString().trim(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const rateLimited = /429|rate/i.test(message);
      const creditsOut = /402|credit/i.test(message);
      return {
        ok: false,
        score: 0,
        hits: [],
        misses: [],
        feedback: rateLimited
          ? "Coaching is busy right now. Try again in a moment, or use the self-check rubric below."
          : creditsOut
            ? "AI coaching credits are exhausted. Use the self-check rubric below for now."
            : "Coaching hit a snag. Use the self-check rubric below and try again shortly.",
        suggestion: "",
        error: message,
      };
    }
  });

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last > first) return text.slice(first, last + 1);
  return text.trim();
}