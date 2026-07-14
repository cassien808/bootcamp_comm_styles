// Single source of truth for the DISC-style content used across the module.
// Colors map to SanMar brand tokens (accent use only; blues still lead the UI).

export type StyleKey = "d" | "i" | "s" | "c";

export interface StyleInfo {
  key: StyleKey;
  name: string;
  tagline: string;
  wants: string;
  gift: string;
  risk: string;
  blindSpot: string;
  colorVar: string; // CSS var for accent
  softVar: string; // CSS var for soft background
  tells: string[]; // 5 concrete "tells" used by the AI coach + rubric
  traits: string[]; // used by the sort activity
  reflection: string;
}

export const STYLES: Record<StyleKey, StyleInfo> = {
  d: {
    key: "d",
    name: "Dominant",
    tagline: "Direct, results-first, moves fast",
    wants: "The bottom line, options, and control of the outcome.",
    gift: "Cuts through noise and drives decisions.",
    risk: "Can steamroll input and miss the human cost.",
    blindSpot: "Skips the why, leaves people feeling run over.",
    colorVar: "var(--rucksack)",
    softVar: "var(--rucksack-soft)",
    tells: [
      "Leads with the ask or the outcome in the first sentence",
      "Short sentences, strong verbs, no hedging",
      "Offers 2-3 options with a clear recommendation",
      "Names the deadline or decision point up front",
      "Skips small talk; ends with a next step",
    ],
    traits: [
      "Blunt",
      "Decisive",
      "Fast-paced",
      "Results-focused",
    ],
    reflection:
      "When has moving fast helped your team win? When has it cost you trust?",
  },
  i: {
    key: "i",
    name: "Influencer",
    tagline: "Warm, expressive, people-first",
    wants: "Connection, enthusiasm, and a story they can rally around.",
    gift: "Energizes the room and builds momentum.",
    risk: "Can gloss over detail and overpromise.",
    blindSpot: "Reads silence as agreement.",
    colorVar: "var(--origin)",
    softVar: "var(--origin-soft)",
    tells: [
      "Opens with warmth, a name, or shared context",
      "Uses vivid language and emotion words",
      "Frames the ask as a story or a shared win",
      "Invites collaboration and asks for their take",
      "Ends with encouragement, not just a task",
    ],
    traits: [
      "Enthusiastic",
      "Persuasive",
      "Optimistic",
      "Talkative",
    ],
    reflection:
      "When has your energy pulled the team forward? When has it skipped a detail that mattered?",
  },
  s: {
    key: "s",
    name: "Steady",
    tagline: "Calm, supportive, values harmony",
    wants: "Time to think, reassurance, and a sense that the team is okay.",
    gift: "Holds the team together in change.",
    risk: "Avoids conflict and defers too long.",
    blindSpot: "Says yes when they mean not yet.",
    colorVar: "var(--sonic)",
    softVar: "var(--sonic-soft)",
    tells: [
      "Acknowledges the person before the task",
      "Gives context and reason, not just direction",
      "Signals that support is available",
      "Sets a gentle pace with a clear but not urgent deadline",
      "Confirms understanding and invites questions",
    ],
    traits: [
      "Patient",
      "Loyal",
      "Consistent",
      "Good listener",
    ],
    reflection:
      "When has your steadiness been the thing that kept your team going? When has it delayed a hard call?",
  },
  c: {
    key: "c",
    name: "Conscientious",
    tagline: "Precise, analytical, quality-first",
    wants: "Facts, structure, and time to do it right.",
    gift: "Catches what everyone else missed.",
    risk: "Gets stuck in detail; can seem cold.",
    blindSpot: "Assumes data speaks for itself.",
    colorVar: "var(--core)",
    softVar: "var(--sky)",
    tells: [
      "Leads with context: what, why, and what's already true",
      "Uses precise words, numbers, and named criteria",
      "Lays out steps or structure the reader can verify",
      "Anticipates questions and answers them in advance",
      "Ends with a clear next step and how you'll know it's done",
    ],
    traits: [
      "Detail-oriented",
      "Analytical",
      "Careful",
      "Standards-driven",
    ],
    reflection:
      "When has your precision saved the team? When has it slowed a decision that just needed a call?",
  },
};

export const STYLE_ORDER: StyleKey[] = ["d", "i", "s", "c"];

// A single bland source message used across the rewriter drill and capstone fallback.
export const BLAND_SOURCE_MESSAGE =
  "Hi — the deadline moved up. Can you get your piece to me two days earlier than planned? Thanks.";

// Emails used in "spot it in the wild"
export interface SampleEmail {
  from: string;
  subject: string;
  body: string;
  answer: StyleKey;
  tell: string;
}

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    from: "Alex Morgan <alex@company.com>",
    subject: "Q3 launch — decision needed by Friday",
    body:
      "Two options for the Q3 launch: hold and polish (adds 2 weeks) or ship as-is and patch. Recommend ship. Need your call by Friday 4pm. — Alex",
    answer: "d",
    tell: "Bottom line first, two options, a recommendation, a deadline, no small talk. Classic Dominant.",
  },
  {
    from: "Priya Shah <priya@company.com>",
    subject: "So excited about this next chapter!!",
    body:
      "Team!! I can't tell you how proud I am of what we pulled off this quarter. You are the reason this works. Let's grab time this week — I have ideas I think you'll love. — P",
    answer: "i",
    tell: "Warm opener, exclamation points, shared story, invites connection over a task. Classic Influencer.",
  },
  {
    from: "Sam Rivera <sam@company.com>",
    subject: "Checking in — no rush",
    body:
      "Hi — hope you had a good weekend. I wanted to make sure the plan we talked about still feels okay with the new timeline. Happy to jump on a quick call if it helps. No rush, just checking. — Sam",
    answer: "s",
    tell: "Acknowledges the person first, offers support, soft pace, no pressure. Classic Steady.",
  },
  {
    from: "Jordan Lee <jordan@company.com>",
    subject: "Q3 report — 4 items to review before signoff",
    body:
      "Context: the Q3 report is ready pending 4 items. 1) Reconcile row 12 (variance of 3.2%). 2) Confirm assumption on churn (current: 4.1%). 3) Update footnote 7. 4) Approve final chart labels. Aiming to lock by Thursday EOD. — Jordan",
    answer: "c",
    tell: "Structured, numbered, precise figures, clear criteria for done. Classic Conscientious.",
  },
];