import { defineTool } from "@lovable.dev/mcp-js";
import { SAMPLE_EMAILS } from "@/lib/disc";

export default defineTool({
  name: "list_sample_emails",
  title: "List sample emails by style",
  description:
    "Return the four sample workplace emails used in the 'spot it in the wild' activity. Each email includes the sender, subject, body, the correct DISC style answer, and the tell that gives that style away. Useful as training examples for communication-style classification.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(SAMPLE_EMAILS, null, 2) }],
    structuredContent: { emails: SAMPLE_EMAILS },
  }),
});