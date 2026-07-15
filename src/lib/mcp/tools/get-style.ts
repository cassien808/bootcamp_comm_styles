import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { STYLES } from "@/lib/disc";

export default defineTool({
  name: "get_communication_style",
  title: "Get one communication style",
  description:
    "Get full detail for one DISC style by its key: 'd' (Dominant), 'i' (Influencer), 's' (Steady), or 'c' (Conscientious). Returns the tagline, what the reader wants, gift, risk, blind spot, the five tells, traits, and a reflection prompt.",
  inputSchema: {
    key: z.enum(["d", "i", "s", "c"]).describe("Style key: d, i, s, or c."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ key }) => {
    const s = STYLES[key];
    return {
      content: [{ type: "text", text: JSON.stringify(s, null, 2) }],
      structuredContent: { style: s },
    };
  },
});