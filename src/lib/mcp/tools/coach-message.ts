import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { coachMessage } from "@/lib/coaching.functions";

export default defineTool({
  name: "coach_message",
  title: "Coach a message for a target style",
  description:
    "Score a leader's draft message against a target reader's DISC style. Returns which of the five style 'tells' the message hits and misses, specific written feedback, and one suggested rewrite tuned for that style. Uses AI coaching; may return a fallback message if the coach is unavailable.",
  inputSchema: {
    targetStyle: z
      .enum(["d", "i", "s", "c"])
      .describe("Reader's default style: d, i, s, or c."),
    message: z
      .string()
      .min(1)
      .max(4000)
      .describe("The draft message the leader wrote."),
    context: z
      .string()
      .max(1000)
      .optional()
      .describe("Optional context about the reader or situation."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (input) => {
    const result = await coachMessage({
      data: { ...input, mode: "capstone" as const },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: { result },
      isError: !result.ok,
    };
  },
});