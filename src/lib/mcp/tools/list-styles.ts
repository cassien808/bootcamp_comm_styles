import { defineTool } from "@lovable.dev/mcp-js";
import { STYLES, STYLE_ORDER } from "@/lib/disc";

export default defineTool({
  name: "list_communication_styles",
  title: "List communication styles",
  description:
    "List the four DISC-based communication styles (Dominant, Influencer, Steady, Conscientious) with each style's tagline, what that reader wants, their gift, risk, blind spot, and the five 'tells' that show a message is written in that style.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const styles = STYLE_ORDER.map((key) => {
      const s = STYLES[key];
      return {
        key: s.key,
        name: s.name,
        tagline: s.tagline,
        wants: s.wants,
        gift: s.gift,
        risk: s.risk,
        blindSpot: s.blindSpot,
        tells: s.tells,
        traits: s.traits,
      };
    });
    return {
      content: [{ type: "text", text: JSON.stringify(styles, null, 2) }],
      structuredContent: { styles },
    };
  },
});