import type { StyleKey } from "./disc";

// A branching scenario. Each choice can move to a different next scene,
// so the conversation genuinely reshapes based on what you say. Every
// choice also carries a trust delta (how Jordan's trust shifts) and
// richer feedback: what you likely *meant*, what Jordan *heard*, and a
// stronger flex you could have used.

export type Landed = "well" | "ok" | "poorly";

export interface ScenarioChoice {
  label: string;
  reply: string;
  style: StyleKey;
  landed: Landed;
  /** How Jordan's trust shifts (-25..+25 roughly). */
  trustDelta: number;
  /** What you were probably trying to do. */
  meant: string;
  /** How a Steady reader like Jordan actually receives it. */
  heard: string;
  /** A stronger version of the same intent, tuned to Jordan. */
  stronger: string;
  reaction: string; // what Jordan does/says next
  coach: string; // the short principle behind the feedback
  /** id of the next scene, or null to end the conversation. */
  next: string | null;
}

export interface ScenarioStep {
  id: string;
  /** Short label used in the run summary. */
  title: string;
  jordan: string; // what Jordan says
  setup: string; // stage direction / context
  choices: ScenarioChoice[];
}

export const SCENARIO_START_ID = "opening";
export const TRUST_START = 50;
export const TRUST_MIN = 0;
export const TRUST_MAX = 100;
/** Trust required to unlock the "you rebuilt the room" debrief. */
export const TRUST_UNLOCK = 70;

// Jordan is a Steady-style direct report who's quietly disengaged after a
// reorg. The strongest flexes acknowledge the person first, give context,
// and offer support without pushing for a fast decision.
export const JORDAN_SCENES: Record<string, ScenarioStep> = {
  opening: {
    id: "opening",
    title: "Opening the 1:1",
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
        trustDelta: -18,
        meant: "Respect their time and get the work moving.",
        heard: "The work matters, I don't. Don't bring anything real up.",
        stronger:
          "Long week — I hear that. Before we get into the list, how are you doing?",
        reaction:
          "Jordan straightens up and runs through the status crisply. Eye contact drops. The rest of the meeting stays surface-level.",
        coach:
          "Task-first openings close a Steady reader down. Acknowledge the person for one sentence, then move into the work.",
        next: "stayedClosed",
      },
      {
        label: "Name what you're noticing",
        reply:
          "Long weeks are real. I've noticed you've been quieter since the reorg. I'm not asking you to fix that in this meeting — I just want to check in before we get into the list.",
        style: "s",
        landed: "well",
        trustDelta: 18,
        meant: "Let them know I see them, without making them perform.",
        heard: "It's safe to say what's actually going on.",
        stronger:
          "This one already lands. Keep the same shape: notice → make it safe → give them space.",
        reaction:
          "Jordan pauses, exhales, and says: \"Yeah. I'm still processing it, honestly. I didn't know if it was okay to bring up.\" The conversation opens.",
        coach:
          "Named the pattern, made it safe, gave space. That's the Steady flex.",
        next: "openedUp",
      },
      {
        label: "Big energy",
        reply:
          "Hey! Rough week, I feel that. Okay so I've got some great stuff to run through — you're going to love where we're headed!",
        style: "i",
        landed: "poorly",
        trustDelta: -10,
        meant: "Lift the mood so the meeting doesn't feel heavy.",
        heard: "You're supposed to match my energy, so I'd better fake it.",
        stronger:
          "Rough week — same here. Before I get into the list, is there anything on your side you want space for?",
        reaction:
          "Jordan nods slowly and gives a small, polite smile. You can feel them go a bit further inward.",
        coach:
          "Warmth is right, volume is wrong. Turn the same warmth down two notches for a Steady reader.",
        next: "stayedClosed",
      },
      {
        label: "Structured check-in",
        reply:
          "Before status: three quick questions. On a 1-5, how's your workload? What's blocking you? What support would help?",
        style: "c",
        landed: "ok",
        trustDelta: 4,
        meant: "Give them a clean structure so nothing important gets skipped.",
        heard: "I can answer the questions, but the real stuff doesn't fit the form.",
        stronger:
          "Long week — noted. One soft question first: how are you doing? Then I've got three quick check-in prompts.",
        reaction:
          "Jordan answers each in one sentence. Accurate, useful — but the emotional weight of the last three weeks stays under the surface.",
        coach:
          "Structure gets you data, not trust. Soften the opener first, then bring the frame.",
        next: "partiallyOpen",
      },
    ],
  },
  openedUp: {
    id: "openedUp",
    title: "Jordan opens up",
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
        trustDelta: -12,
        meant: "Comfort them and keep the meeting moving.",
        heard: "Please stop talking about this. It makes us both uncomfortable.",
        stronger:
          "That's a real thing to carry. Say more about which part feels the least clear — I'd rather sit with it than jump past it.",
        reaction:
          "Jordan says \"yeah, thanks\" and shifts to the sprint items. Something closes behind their eyes.",
        coach:
          "Fast reassurance reads as \"don't bring this up again.\" Sit in it first, then act.",
        next: "closeMixed",
      },
      {
        label: "Acknowledge, then one concrete step",
        reply:
          "That's a real thing to feel, and I'm sorry you've been carrying it quietly. Here's what I can do this week: I'll set up a 30-min intro between you and the new director, and I'll write down where your work sits in the new priorities so it's not in my head.",
        style: "s",
        landed: "well",
        trustDelta: 20,
        meant: "Validate what they said, then make my support concrete.",
        heard: "You heard me and you're actually going to do something.",
        stronger:
          "Same shape works — keep the acknowledgment before the action, and keep the actions small and dated.",
        reaction:
          "Jordan's shoulders drop half an inch. \"That would really help. Thank you.\" They stay in the conversation.",
        coach:
          "Acknowledge → one or two small, specific actions. That's the pattern a Steady reader trusts.",
        next: "closeWarm",
      },
      {
        label: "Get analytical",
        reply:
          "Let's map it. Your work streams: A, B, and C. Under the new org, A reports up through Dana, B is unchanged, C is being reassigned. Does that clarify?",
        style: "c",
        landed: "ok",
        trustDelta: 3,
        meant: "Reduce ambiguity by showing the new shape of things.",
        heard: "The map is helpful — but you skipped the part I was actually asking about.",
        reaction:
          "Jordan nods. \"Yeah, that's helpful.\" They engage on the map but the underlying feeling stays unspoken.",
        stronger:
          "That's a real thing to feel. Let me map it so it's less foggy — A goes to Dana, B is unchanged, C moves.",
        coach:
          "Lead with the person for one sentence. Then the map lands.",
        next: "closeMixed",
      },
      {
        label: "Push for their decision",
        reply:
          "Okay — so what do you want to do about it? Do you want a move, more scope, less scope? Tell me and I'll advocate.",
        style: "d",
        landed: "poorly",
        trustDelta: -15,
        meant: "Turn the feeling into action and show I'll go to bat.",
        heard: "You just made my feelings my homework.",
        stronger:
          "You don't need to answer this now. Sit with it a week and bring me one thing you'd change to next 1:1.",
        reaction:
          "Jordan freezes for a second. \"I... don't know yet. I need to think.\" They deflect the rest of the meeting.",
        coach:
          "After a vulnerable share, a Steady reader can't answer \"what do you want.\" Give them time and a smaller ask.",
        next: "closeMixed",
      },
    ],
  },
  partiallyOpen: {
    id: "partiallyOpen",
    title: "Data-only reply",
    setup:
      "Jordan answered your check-in questions in clean, short sentences — workload's fine, no blockers, no ask. Accurate, and completely closed. You can feel there's more underneath.",
    jordan:
      "Yeah, everything's fine. Sprint's on track. Nothing you need to help with.",
    choices: [
      {
        label: "Soften and try again",
        reply:
          "Okay — I hear you saying the work's fine. I'm asking about you, not the sprint. Since the reorg, how are you actually doing?",
        style: "s",
        landed: "well",
        trustDelta: 16,
        meant: "Reset the register. Make it clearly about the person, not the work.",
        heard: "They noticed I was answering the wrong question. It's safe to say the real thing.",
        stronger:
          "Same shape. Naming the difference between \"work\" and \"you\" is the move.",
        reaction:
          "Jordan pauses. \"Honestly? Since the reorg I don't know where I fit anymore.\" The real conversation starts.",
        coach:
          "Structure got you a status report. Softening got you the person. Both, in that order.",
        next: "openedUp",
      },
      {
        label: "Take the answer at face value",
        reply:
          "Great, thanks. Let's move on then — top of the list is the migration plan.",
        style: "c",
        landed: "ok",
        trustDelta: 2,
        meant: "Respect their answer and use the time on the work.",
        heard: "Nothing to see here — I'm invisible and that's fine.",
        stronger:
          "Okay, holding that. If anything shifts between now and next week, my door's open. Now — migration plan.",
        reaction:
          "Jordan gives crisp updates. The meeting is efficient and hollow.",
        coach:
          "You're allowed to accept their answer — just leave a door open before you move on.",
        next: "closeMixed",
      },
      {
        label: "Push once more, task-style",
        reply:
          "Come on, three weeks of 'fine' can't all be fine. What's actually going on?",
        style: "d",
        landed: "poorly",
        trustDelta: -12,
        meant: "Cut through the surface and get the real answer.",
        heard: "You don't believe me and now I have to defend myself.",
        stronger:
          "I might be wrong, but three weeks of 'fine' is a lot. No pressure to say more — just want you to know I'm not in a rush.",
        reaction:
          "Jordan stiffens. \"Everything's fine. Really.\" You lose the last of the opening.",
        coach:
          "Pushing a Steady reader for the \"real answer\" makes them protect it harder.",
        next: "closeCold",
      },
    ],
  },
  stayedClosed: {
    id: "stayedClosed",
    title: "Jordan stayed guarded",
    setup:
      "Jordan is polite and efficient. They give clean status, avoid eye contact, and don't offer anything about themselves. The meeting is almost over.",
    jordan:
      "Anything else on the list? I've got another one in five.",
    choices: [
      {
        label: "Reopen gently",
        reply:
          "One last thing, and then we're done. I know the reorg has been a lot. You don't need to answer now — but I'd like next week's 1:1 to start with how you're doing, not the sprint. Sound okay?",
        style: "s",
        landed: "ok",
        trustDelta: 10,
        meant: "Repair the tone without forcing anything in this meeting.",
        heard: "They noticed. Next week doesn't have to be like this one.",
        stronger:
          "Same idea. Naming what you noticed + naming the reset for next time is the recovery move.",
        reaction:
          "Jordan looks up. \"Yeah. That'd be okay.\" It's small, but the door's back open.",
        coach:
          "When the room went cold, don't fix it in this meeting. Just set a warmer starting line for the next one.",
        next: "closeMixed",
      },
      {
        label: "Push once, hard",
        reply:
          "Hold on — you've been off for three weeks. Talk to me. What's going on?",
        style: "d",
        landed: "poorly",
        trustDelta: -12,
        meant: "Break the surface before they leave the room.",
        heard: "You saved the hard question for the end. This is a trap.",
        stronger:
          "Before you go — no answer needed today. I've noticed the last few weeks feel different. I just want you to know I'm paying attention.",
        reaction:
          "Jordan freezes. \"I'm fine. Really. I have to go.\" They leave a minute later than they wanted to.",
        coach:
          "A cold-open ambush at the end of a meeting is the worst-timed version of a real question.",
        next: "closeCold",
      },
      {
        label: "Wrap it up positive",
        reply:
          "Nope, we're good! Great job on the sprint. Have a great weekend!",
        style: "i",
        landed: "poorly",
        trustDelta: -6,
        meant: "End on a warm note and not add more weight to their day.",
        heard: "Nothing about this meeting told me you noticed.",
        stronger:
          "We're good. Before you go — I'd like next week to start with you, not the sprint. Just a heads up.",
        reaction:
          "Jordan says \"you too\" and closes their laptop. Nothing changed.",
        coach:
          "Ending sunny on a cold meeting confirms the message that the real stuff isn't welcome.",
        next: "closeCold",
      },
    ],
  },
  closeWarm: {
    id: "closeWarm",
    title: "Landing the meeting",
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
        trustDelta: 15,
        meant: "Confirm I heard them, then make the follow-through concrete and dated.",
        heard: "They meant it, and next week won't undo it.",
        stronger:
          "Already the flex. Keep the low-pressure framing on the next 1:1 — 'no big agenda' is the part that matters.",
        reaction:
          "Jordan smiles, small but real. \"Okay. Thank you.\" They leave the meeting a bit lighter than they came in.",
        coach:
          "Two dated actions + a low-pressure next check-in. That's the landing.",
        next: null,
      },
      {
        label: "Rally them",
        reply:
          "You've got this! I believe in you and I know we're going to figure it out together. Onward!",
        style: "i",
        landed: "poorly",
        trustDelta: -10,
        meant: "Send them out with belief and momentum.",
        heard: "You didn't hear me. That was a pep talk over the top of what I said.",
        stronger:
          "I'm glad you did too. Here's what I'll do this week — [one thing]. Next 1:1, no agenda, just checking in.",
        reaction:
          "Jordan says \"thanks\" and closes their laptop. The moment you built dissolves.",
        coach:
          "Cheerleading closes over a Steady share. Quieter, specific, and dated wins.",
        next: null,
      },
      {
        label: "Set a target",
        reply:
          "Great. Come back next week with three things you want changed and I'll take them up the chain.",
        style: "d",
        landed: "poorly",
        trustDelta: -14,
        meant: "Convert what they shared into action they own.",
        heard: "I told you how I felt and you gave me homework.",
        stronger:
          "You don't have to bring me a list. I'll come back next week with what I've moved on. If anything's on your mind, we start there.",
        reaction:
          "Jordan nods and writes it down. You can see them going back into task-mode; the earlier openness is gone.",
        coach:
          "After a soft share, the follow-through is your job. Don't hand it back as homework.",
        next: null,
      },
    ],
  },
  closeMixed: {
    id: "closeMixed",
    title: "Landing a mixed meeting",
    setup:
      "You're at the end. Jordan half-opened, half-stayed guarded. What you do in the last 30 seconds sets the tone for next week.",
    jordan:
      "Okay. Anything else, or are we good?",
    choices: [
      {
        label: "Name it, set a soft reset",
        reply:
          "One thing before you go. I don't think I fully landed today — that's on me. Next 1:1 I want to start with how you're doing, not the sprint. No prep needed on your end.",
        style: "s",
        landed: "well",
        trustDelta: 14,
        meant: "Own the miss and set a warmer starting line for next time.",
        heard: "They know it didn't quite work. They're going to try again.",
        stronger:
          "Same shape. Owning it in one sentence is the whole move — don't over-explain.",
        reaction:
          "Jordan nods slowly. \"Okay. Thanks for saying that.\" You lose zero ground and gain some back.",
        coach:
          "Naming a miss + a specific reset for next time is the highest-leverage 30 seconds in the whole meeting.",
        next: null,
      },
      {
        label: "Move on efficiently",
        reply:
          "Yeah, we're good. Let's pick up the migration thread over Slack.",
        style: "c",
        landed: "ok",
        trustDelta: 1,
        meant: "Respect their time and keep the async thread moving.",
        heard: "Nothing that happened in this meeting mattered.",
        stronger:
          "We're good. One thing — next 1:1 I'll start with you, not the sprint. Just a heads up.",
        reaction:
          "Jordan says \"sounds good\" and drops off. Neutral.",
        coach:
          "Neutral endings after mixed meetings tend to drift down over the week, not up. Set the next starting line before you close.",
        next: null,
      },
      {
        label: "Try to fix it now",
        reply:
          "Wait — I don't want to end without solving this. Talk me through what you actually need.",
        style: "d",
        landed: "poorly",
        trustDelta: -10,
        meant: "Not leave them hanging. Finish what we started.",
        heard: "You're going to keep me here until I produce the right answer.",
        stronger:
          "You don't have to solve this on the spot. If it helps, sleep on it and drop me a note when you're ready.",
        reaction:
          "Jordan stiffens. \"I really do have to go.\" They leave feeling cornered.",
        coach:
          "Trying to close everything in the last 30 seconds usually undoes the good part of the meeting. Let it breathe.",
        next: null,
      },
    ],
  },
  closeCold: {
    id: "closeCold",
    title: "Landing a cold meeting",
    setup:
      "The meeting went sideways. Jordan is checked out. The last 30 seconds are for damage control — not for solving anything.",
    jordan:
      "Okay, I really have to go.",
    choices: [
      {
        label: "Own the miss, no ask",
        reply:
          "Go. One thing first — I got the tone of this wrong today. That's on me, not you. Next week I'll start over. No prep needed.",
        style: "s",
        landed: "well",
        trustDelta: 12,
        meant: "Take responsibility for the temperature, leave no homework, promise a reset.",
        heard: "They noticed. Next week is a real chance to reset.",
        stronger:
          "Same shape. Keep it under two sentences — long apologies read as making them comfort you.",
        reaction:
          "Jordan pauses in the doorway. \"Okay.\" Small, but real.",
        coach:
          "When you're underwater, the recovery move is: own it → no ask of them → concrete reset next time.",
        next: null,
      },
      {
        label: "Let them go quietly",
        reply:
          "Yep, we're good. Talk next week.",
        style: "c",
        landed: "ok",
        trustDelta: -2,
        meant: "Not make it worse by holding them longer.",
        heard: "Nothing about that meeting is going to change.",
        stronger:
          "Yep, go. Before next week — I want to reset the tone. I'll open, no agenda.",
        reaction:
          "Jordan leaves without looking up.",
        coach:
          "Silence after a cold meeting doesn't stay neutral. It ossifies. Say the reset line even if it's short.",
        next: null,
      },
      {
        label: "Salvage with cheer",
        reply:
          "All good! Great sprint! Have a great one!",
        style: "i",
        landed: "poorly",
        trustDelta: -8,
        meant: "End on warmth so it doesn't feel worse than it is.",
        heard: "You're pretending that meeting was normal. Message received.",
        stronger:
          "Have a good one. Next week I want to reset — I'll open, and I want it to be about you first, not the sprint.",
        reaction:
          "Jordan gives a flat \"you too\" and disconnects.",
        coach:
          "Cheerful over cold is the loudest way to confirm you didn't notice.",
        next: null,
      },
    ],
  },
};

/** Ordered array kept for any legacy callers; DO NOT use for playback. */
export const JORDAN_SCENARIO: ScenarioStep[] = [
  JORDAN_SCENES.opening,
  JORDAN_SCENES.openedUp,
  JORDAN_SCENES.closeWarm,
];

export interface ScenarioTurn {
  sceneId: string;
  choiceIdx: number;
}

export function trustAfter(path: ScenarioTurn[]): number {
  let t = TRUST_START;
  for (const turn of path) {
    const scene = JORDAN_SCENES[turn.sceneId];
    const choice = scene?.choices[turn.choiceIdx];
    if (!choice) continue;
    t += choice.trustDelta;
  }
  return Math.max(TRUST_MIN, Math.min(TRUST_MAX, t));
}

export function currentSceneId(path: ScenarioTurn[]): string | null {
  if (path.length === 0) return SCENARIO_START_ID;
  const last = path[path.length - 1];
  const scene = JORDAN_SCENES[last.sceneId];
  const choice = scene?.choices[last.choiceIdx];
  return choice ? choice.next : null;
}

/** Max number of scenes any path visits (for a stable progress denominator). */
export const SCENARIO_TOTAL_SCENES = 3;