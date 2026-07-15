import { defineMcp } from "@lovable.dev/mcp-js";
import listStylesTool from "./tools/list-styles";
import getStyleTool from "./tools/get-style";
import sampleEmailsTool from "./tools/sample-emails";
import coachMessageTool from "./tools/coach-message";

export default defineMcp({
  name: "communication-styles-mcp",
  title: "Communication Styles for Supervisors/Managers",
  version: "0.1.0",
  instructions:
    "Tools for the SanMar communication-styles learning module. Use `list_communication_styles` to see all four DISC styles, `get_communication_style` for one style in detail, `list_sample_emails` for labeled training examples, and `coach_message` to score a draft message against a reader's style and get a suggested rewrite.",
  tools: [listStylesTool, getStyleTool, sampleEmailsTool, coachMessageTool],
});