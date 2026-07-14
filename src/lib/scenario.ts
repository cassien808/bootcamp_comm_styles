import type { StyleKey } from "./disc";

export interface ScenarioChoice {
  label: string;
  reply: string;
  style: StyleKey;
  landed: "well" | "ok" | "poorly";
  reaction: string; // what Jordan does/says next
  coach: string; // what your reply signaled + what a stronger flex sounds like
}

export interface ScenarioStep {
  jordan: string; // what Jordan says
  setup: string; // stage direction / context
  choices: ScenarioChoice[];
}

// Jordan is a Steady-style direct report who's quietly disengaged after a reorg.
// The strongest flexes acknowledge the person first, give context, and offer support
// without pushing for a fast decision.
export const JORDAN_SCENARIO: ScenarioStep[] = [
  {
    setup:
      "You're at the start of a 1:1 with Jordan. Since the reorg three weeks ago, they've been quieter than usual. Their work is still solid, but the spark is gone.",
    jordan:
      "Hey. Yeah, I'm here. Sorry — long week. What did you want to cover?",
    choices: [
      {
        label: "Get to the point",
        reply:
          "Let's just start with the sprint items. First one — the migration plan. Where are you?",
        style: "d",
        landed: "poorly",
        reaction:
          "Jordan straightens up and runs through the status crisply. Eye contact drops. The rest of the meeting stays surface-level.",
        coach:
          "That reply signaled Dominant — task-first, no room to breathe. A Steady reader hears \"you don't matter, just the work.\" A stronger flex acknowledges them first: \"Long week — I hear that. Before we get into the list, how are you doing?\"",
      },
      {
        label: "Name what you're noticing",
        reply:
          "Long weeks are real. I've noticed you've been quieter since the reorg. I'm not asking you to fix that in this meeting — I just want to check in before we get into the list.",
        style: "s",
        landed: "well",
        reaction:
          "Jordan pauses, exhales, and says: \"Yeah. I'm still processing it, honestly. I didn't know if it was okay to bring up.\" The conversation opens.",
        coach:
          "Strong Steady flex. You named what you were seeing, made it safe (not asking them to fix it), and gave them space. That's exactly what a Steady reader needs before real talk.",
      },
      {
        label: "Big energy",
        reply:
          "Hey! Rough week, I feel that. Okay so I've got some great stuff to run through — you're going to love where we're headed!",
        style: "i",
        landed: "poorly",
        reaction:
          "Jordan nods slowly and gives a small, polite smile. You can feel them go a bit further inward.",
        coach:
          "That was Influencer — warmth turned up loud. But a Steady reader in a hard moment hears volume as pressure to match your energy. A quieter warmth lands better: acknowledge, then give space.",
      },
      {
        label: "Structured check-in",
        reply:
          "Before status: three quick questions. On a 1-5, how's your workload? What's blocking you? What support would help?",
        style: "c",
        landed: "ok",
        reaction:
          "Jordan answers each in one sentence. Accurate, useful — but the emotional weight of the last three weeks stays under the surface.",
        coach:
          "Conscientious framing gets you data but not trust. A Steady reader will answer the questions and stay closed. Soften the opener first, then structure works.",
      },
    ],
  },
  {
    setup:
      "Jordan has opened up a little. They mention the reorg moved them under a new director they don't know, and they're not sure where they fit anymore.",
    jordan:
      "I guess I just don't know if the work I'm doing still matters here. It feels like the ground moved and no one told me where to stand.",
    choices: [
      {
        label: "Reassure and move on",
        reply:
          "You matter here. Your work is great. Don't worry — it'll settle. Let's get into the sprint.",
        style: "i",
        landed: "poorly",
        reaction:
          "Jordan says \"yeah, thanks\" and shifts to the sprint items. Something closes behind their eyes.",
        coach:
          "The warmth was real but generic. A Steady reader hears fast reassurance as \"don't bring this up again.\" Sit in it with them: acknowledge the loss, then offer one concrete thing you'll do.",
      },
      {
        label: "Acknowledge, then one concrete step",
        reply:
          "That's a real thing to feel, and I'm sorry you've been carrying it quietly. Here's what I can do this week: I'll set up a 30-min intro between you and the new director, and I'll write down where your work sits in the new priorities so it's not in my head.",
        style: "s",
        landed: "well",
        reaction:
          "Jordan's shoulders drop half an inch. \"That would really help. Thank you.\" They stay in the conversation.",
        coach:
          "This is the flex. You acknowledged without fixing, then gave them two specific, small actions — the pattern a Steady reader trusts. Support signaled, no pressure applied.",
      },
      {
        label: "Get analytical",
        reply:
          "Let's map it. Your work streams: A, B, and C. Under the new org, A reports up through Dana, B is unchanged, C is being reassigned. Does that clarify?",
        style: "c",
        landed: "ok",
        reaction:
          "Jordan nods. \"Yeah, that's helpful.\" They engage on the map but the underlying feeling stays unspoken.",
        coach:
          "Structure helped, but you skipped the acknowledgment. A Steady reader needs \"I hear you\" before \"here's the map.\" Lead with the person for 10 seconds, then bring the structure.",
      },
      {
        label: "Push for their decision",
        reply:
          "Okay — so what do you want to do about it? Do you want a move, more scope, less scope? Tell me and I'll advocate.",
        style: "d",
        landed: "poorly",
        reaction:
          "Jordan freezes for a second. \"I... don't know yet. I need to think.\" They deflect the rest of the meeting.",
        coach:
          "Dominant push. A Steady reader who's just voiced something vulnerable can't answer \"what do you want\" on the spot. Give them a week and a smaller question: \"Want to think on it and bring one thing you'd change to next week's 1:1?\"",
      },
    ],
  },
  {
    setup:
      "Time's almost up. You want Jordan to leave this meeting with something concrete that says: I see you, and I'm on it.",
    jordan:
      "Thanks for actually asking. I wasn't sure how much to say.",
    choices: [
      {
        label: "Close with warmth and a next step",
        reply:
          "Glad you did. I'll set up the intro this week and send you the priorities map by Friday. Next 1:1, let's just check on how it's landing — no big agenda.",
        style: "s",
        landed: "well",
        reaction:
          "Jordan smiles, small but real. \"Okay. Thank you.\" They leave the meeting a bit lighter than they came in.",
        coach:
          "Landing well. Two concrete actions with dates, a next check-in framed as low-pressure, and warmth that matches the moment. That's the flex.",
      },
      {
        label: "Rally them",
        reply:
          "You've got this! I believe in you and I know we're going to figure it out together. Onward!",
        style: "i",
        landed: "poorly",
        reaction:
          "Jordan says \"thanks\" and closes their laptop. The moment you built dissolves.",
        coach:
          "Influencer close on a Steady moment reads as brushing past what they just shared. Match their register: quieter, specific, follow-through beats cheerleading.",
      },
      {
        label: "Set a target",
        reply:
          "Great. Come back next week with three things you want changed and I'll take them up the chain.",
        style: "d",
        landed: "poorly",
        reaction:
          "Jordan nods and writes it down. You can see them going back into task-mode; the earlier openness is gone.",
        coach:
          "Dominant close after a soft opening breaks trust. You just asked them to translate feelings into a work assignment. Slow down; make the follow-through your job, not theirs.",
      },
    ],
  },
];