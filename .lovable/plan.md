
## What we're building

One learning app that merges your AI-coach and rubric prototypes, rebuilt around adult-learning principles, restyled to the SanMar brand, and extended with a branching workplace scenario, a team map, a style-flex drill, and a calendar-based transfer reminder.

## Instructional design structure

Restructured around Kolb's experiential cycle + andragogy (Knowles). Every screen has one clear job.

1. **Activate** — welcome, pre-module confidence slider, and "bring someone real into the room" prompt (anchors learning to a real person).
2. **Frame** — cost of miscommunication for people leaders. Short, no fluff.
3. **Concept** — the two questions that place every style; the 4-style overview.
4. **Self-awareness** — pick your default under pressure; see the gift + risk; short reflection prompt.
5. **Guided practice (progressive difficulty)**
   - Sort traits → styles (recognition)
   - Match blind spots (application)
   - Spot it in the wild — 3 emails, one per style except your own (transfer)
6. **Style-flex rewriter drill (NEW)** — one bland message, rewrite it in each of the 4 styles. AI coach gives line-level feedback on tells (verbs, structure, warmth cues). Progresses only when each rewrite hits ≥3 of the 5 tells for that style.
7. **Branching scenario (NEW)** — a 1:1 with "Jordan," a Steady-style direct report who's quietly disengaged. 3 decision points, 3–4 reply choices each. Every choice shows how Jordan reacts, what style your reply signaled, and what a stronger flex would sound like. Replayable.
8. **Team map builder (NEW)** — plot 3–5 real teammates on the DISC grid. For each, generates a printable "how to run your next 1:1 with them" cheat-sheet (what to open with, what to avoid, how to give feedback).
9. **Capstone** — write the real message to the real person from screen 1. AI coach primary, rubric self-check fallback (toggle).
10. **Transfer plan + calendar reminder (NEW)** — the "one person, one flex, this week" commitment. Learner clicks "Remind me in 7 days" → downloads a pre-filled .ics file (their commitment text as the event body) to drop into Outlook/Google Calendar. Zero backend, zero accounts, no email pipeline needed.
11. **Post-module confidence check** — same slider as screen 1, side-by-side delta.
12. **Spaced recap** — 60-second printable cheat-sheet of the whole module.

Adult-learning moves baked in throughout:
- Every activity ties to their real person or a realistic manager scenario (relevance).
- Immediate, specific feedback — never just right/wrong ("here's the tell you missed").
- Learner controls pace; can revisit any screen; nothing locks once completed.
- Reflection prompts at 2 checkpoints (after self-awareness, after scenario).
- Transfer commitment + concrete .ics reminder bridges knowing → doing.

## Branding (SanMar)

Per your brand guide:
- **Blues lead**: Foundation Blue `#093354` for headers, Deep Blue `#074A8D` for primary actions, Core Blue `#326CDB` for interactive states, Sky Blue `#B5D5F5` for soft backgrounds.
- **Greens/Oranges as accents only**, mapped to the 4 DISC styles: Rucksack Orange (Dominant), Origin Yellow (Influencer), Sonic Green (Steady), Core Blue (Conscientious). Keeps blues dominant while giving each style a brand-legal color.
- **Neutrals**: Off-White `#F8F6F0` background, Warm Gray `#E0DCD5` borders, Dark Gray `#333333` body.
- **Typography**: Financier Display and Area aren't licensed for web embed on Google Fonts. I'll wire brand-faithful substitutes — **Fraunces** for headers (elegant serif, closest to Financier), **Manrope** for subheads/body (geometric humanist, closest to Area). All defined as CSS tokens, so swapping to licensed woff2 files later is a one-line change.

## Persistence (localStorage, this browser only)

Saved per learner: current screen, all interaction answers, self/target style picks, rewriter results, scenario choices, team map, capstone draft, confidence scores, transfer commitment. On return: "Welcome back — resume where you left off?" with a start-fresh option.

## AI coaching

Used in two places, same server function, same DISC-tells knowledge base:
- **Style-flex drill**: scores each rewrite against the target style's 5 tells, points out what's missing.
- **Capstone**: line-level feedback + one suggested rewrite tuned to the target style.

Falls back to rubric automatically if AI is unavailable. Rubric toggle remains.

## What's NOT in this pass (and why)

- **Emailed 7-day reminders**: kept out on purpose. Would need Lovable Cloud + learner accounts + a verified SanMar email domain + a scheduled-send job + unsubscribe handling. That's a real backend project and it breaks the "nothing leaves this screen" promise. The .ics calendar reminder gets you 90% of the behavioral outcome with 0% of the backend. Easy to add real email reminders as phase 2 if you decide it's worth the setup.
- **Video for the branching scenario**: dialog-based first; video is a straightforward follow-up.
- **Manager/admin dashboards, completion reporting, LMS export (SCORM/xAPI)**: not in scope; would need accounts + Cloud + reporting infra.

## Technical notes

- **Stack**: TanStack Start (already scaffolded). Single route `/` hosts the player.
- **AI**: Lovable AI Gateway via `createServerFn` in `src/lib/coaching.functions.ts`. System prompt encodes DISC tells per style. No Cloud/DB needed since persistence is localStorage.
- **State**: single `useReducer` for module state; localStorage sync via a small hook.
- **Files added/changed**:
  - `src/routes/__root.tsx` — brand fonts via `<link>`, SanMar meta, favicon
  - `src/styles.css` — SanMar design tokens
  - `src/routes/index.tsx` — player shell
  - `src/components/player/*` — topbar, progress, footer nav
  - `src/components/screens/*` — one file per screen (12 screens)
  - `src/components/scenario/*` — branching scenario engine + Jordan dialog
  - `src/components/rewriter/*` — style-flex drill
  - `src/components/team-map/*` — DISC grid + per-person cheat-sheet
  - `src/lib/disc.ts` — style data, tells, blind spots, gifts/risks (single source of truth)
  - `src/lib/coaching.functions.ts` — AI coach server function
  - `src/lib/ics.ts` — .ics generator for the 7-day reminder
  - `src/hooks/use-module-state.ts` — reducer + localStorage sync
