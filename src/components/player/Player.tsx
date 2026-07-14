import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useModuleState } from "@/hooks/use-module-state";
import {
  BLAND_SOURCE_MESSAGE,
  SAMPLE_EMAILS,
  STYLES,
  STYLE_ORDER,
  type StyleKey,
} from "@/lib/disc";
import { JORDAN_SCENARIO } from "@/lib/scenario";
import { buildReminderIcs, downloadIcs } from "@/lib/ics";
import { coachMessage } from "@/lib/coaching.functions";
import { StyleBadge } from "./StyleBadge";

// ----- Screen registry -----
const SCREENS = [
  "welcome",
  "activate",
  "why",
  "concept",
  "self",
  "sort",
  "match",
  "spot",
  "rewriter",
  "scenario",
  "team",
  "capstone",
  "transfer",
  "post",
  "recap",
] as const;
type Screen = (typeof SCREENS)[number];

const SCREEN_TITLES: Record<Screen, string> = {
  welcome: "Welcome",
  activate: "Your starting point",
  why: "Why it matters",
  concept: "The model",
  self: "Your default",
  sort: "Sort the traits",
  match: "Blind spots",
  spot: "Spot it in the wild",
  rewriter: "Style-flex drill",
  scenario: "1:1 with Jordan",
  team: "Your team map",
  capstone: "Write it for real",
  transfer: "Your 7-day flex",
  post: "Confidence check",
  recap: "Take it with you",
};

export function Player() {
  const { state, update, reset, goTo, hydrated } = useModuleState();
  const [showResume, setShowResume] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);

  // Only prompt to resume once, on first hydration — not every time the learner advances.
  useEffect(() => {
    if (hydrated && state.cur > 0) setShowResume(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const cur = state.cur;
  const total = SCREENS.length;
  const screenKey = SCREENS[cur];

  const canAdvance = useMemo(() => gate(screenKey, state), [screenKey, state]);

  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [cur]);

  if (!hydrated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--off-white)" }} />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--off-white)" }}
    >
      {showResume && cur > 0 && (
        <ResumeBanner
          screen={SCREEN_TITLES[screenKey]}
          onResume={() => setShowResume(false)}
          onRestart={() => {
            reset();
            setShowResume(false);
          }}
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <Topbar
          cur={cur}
          total={total}
          onOpenCheat={() => setCheatOpen(true)}
          onJump={(i) => goTo(i)}
        />

        <div ref={stageRef} className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <ScreenView
            screen={screenKey}
            state={state}
            update={update}
            goTo={goTo}
          />
        </div>

        {cur > 0 && (
          <Footer
            cur={cur}
            total={total}
            canAdvance={canAdvance}
            onBack={() => goTo(Math.max(0, cur - 1))}
            onNext={() => {
              if (cur === total - 1) {
                reset();
                return;
              }
              if (canAdvance) goTo(Math.min(total - 1, cur + 1));
            }}
          />
        )}
      </div>
      <CheatSheetDrawer open={cheatOpen} onClose={() => setCheatOpen(false)} />
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {`Now on step ${cur + 1} of ${total}: ${SCREEN_TITLES[screenKey]}`}
      </div>
    </div>
  );
}

function ResumeBanner({
  screen,
  onResume,
  onRestart,
}: {
  screen: string;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div
      className="w-full border-b"
      style={{
        backgroundColor: "var(--sky)",
        borderColor: "var(--warm-gray)",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
        <span style={{ color: "var(--foundation)" }}>
          Welcome back. Resume at <b>{screen}</b>?
        </span>
        <div className="flex gap-2">
          <button
            onClick={onRestart}
            className="rounded-md border px-3 py-1.5 text-sm font-semibold"
            style={{
              borderColor: "var(--foundation)",
              color: "var(--foundation)",
              backgroundColor: "transparent",
            }}
          >
            Start fresh
          </button>
          <button
            onClick={onResume}
            className="rounded-md px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: "var(--foundation)",
              color: "#fff",
            }}
          >
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}

function Topbar({
  cur,
  total,
  onOpenCheat,
  onJump,
}: {
  cur: number;
  total: number;
  onOpenCheat: () => void;
  onJump: (i: number) => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 border-b px-5 pt-4 pb-3 sm:px-8"
      style={{
        backgroundColor: "rgba(248,246,240,0.92)",
        backdropFilter: "blur(10px)",
        borderColor: "var(--warm-gray)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--foundation)" }}
        >
          Communication Styles for People Leaders
        </span>
        <div className="flex items-center gap-3">
          {cur >= 3 && (
            <button
              onClick={onOpenCheat}
              className="rounded-md border px-2.5 py-1 text-xs font-semibold"
              style={{
                borderColor: "var(--foundation)",
                color: "var(--foundation)",
                backgroundColor: "transparent",
              }}
              aria-label="Open styles cheat sheet"
            >
              Cheat sheet
            </button>
          )}
          <span
            className="text-xs tabular-nums"
            style={{ color: "var(--muted-foreground)" }}
          >
            Step {cur + 1} of {total}
          </span>
        </div>
      </div>
      <div
        className="flex gap-[3px]"
        role="progressbar"
        aria-valuenow={cur + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${cur + 1} of ${total}: ${SCREEN_TITLES[SCREENS[cur]]}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const next = e.currentTarget.parentElement?.children[
                  Math.min(total - 1, i + 1)
                ] as HTMLButtonElement | undefined;
                next?.focus();
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const prev = e.currentTarget.parentElement?.children[
                  Math.max(0, i - 1)
                ] as HTMLButtonElement | undefined;
                prev?.focus();
              } else if (e.key === "Home") {
                e.preventDefault();
                (
                  e.currentTarget.parentElement?.firstElementChild as
                    | HTMLButtonElement
                    | undefined
                )?.focus();
              } else if (e.key === "End") {
                e.preventDefault();
                (
                  e.currentTarget.parentElement?.lastElementChild as
                    | HTMLButtonElement
                    | undefined
                )?.focus();
              }
            }}
            title={`${SCREEN_TITLES[SCREENS[i]]}${i < cur ? " (completed)" : ""}`}
            aria-label={`Go to step ${i + 1}: ${SCREEN_TITLES[SCREENS[i]]}${
              i === cur ? " (current)" : i < cur ? " (completed)" : ""
            }`}
            aria-current={i === cur ? "step" : undefined}
            className="h-1 flex-1 rounded-full"
            style={{
              backgroundColor:
                i < cur
                  ? "var(--foundation)"
                  : i === cur
                    ? "var(--core)"
                    : "var(--warm-gray)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CheatSheetDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    // Move focus into the drawer.
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("aria-hidden"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (active && !root.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Return focus to whatever opened the drawer.
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Styles cheat sheet"
    >
      <button
        onClick={onClose}
        aria-label="Close cheat sheet"
        tabIndex={-1}
        className="flex-1 cursor-default"
        style={{ backgroundColor: "rgba(9,51,84,0.35)" }}
      />
      <div
        ref={panelRef}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-white shadow-2xl sm:w-[420px]"
        style={{ borderColor: "var(--warm-gray)" }}
      >
        <div
          className="sticky top-0 flex items-center justify-between border-b px-5 py-3"
          style={{
            backgroundColor: "var(--off-white)",
            borderColor: "var(--warm-gray)",
          }}
        >
          <div
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--foundation)" }}
          >
            Styles at a glance
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close cheat sheet"
            className="rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{
              borderColor: "var(--warm-gray)",
              color: "var(--foundation)",
            }}
          >
            Close
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          {STYLE_ORDER.map((k) => {
            const s = STYLES[k];
            return (
              <div
                key={k}
                className="rounded-xl border p-3"
                style={{
                  borderColor: s.colorVar,
                  backgroundColor: s.softVar,
                }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <div
                    className="text-base font-bold"
                    style={{ color: "var(--foundation)" }}
                  >
                    {s.name}
                  </div>
                  <span
                    className="text-xs italic"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {s.tagline}
                  </span>
                </div>
                <div
                  className="mb-2 text-xs"
                  style={{ color: "var(--foreground)" }}
                >
                  <b>Wants:</b> {s.wants}
                </div>
                <div
                  className="mb-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  How it sounds
                </div>
                <ul
                  className="ml-4 list-disc text-xs"
                  style={{ color: "var(--foreground)" }}
                >
                  {s.tells.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Footer({
  cur,
  total,
  canAdvance,
  onBack,
  onNext,
}: {
  cur: number;
  total: number;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const last = cur === total - 1;
  const label = last ? "Start over" : cur === total - 2 ? "Finish" : "Continue";
  return (
    <div
      className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t px-5 py-3 sm:px-8"
      style={{
        backgroundColor: "rgba(248,246,240,0.92)",
        backdropFilter: "blur(10px)",
        borderColor: "var(--warm-gray)",
      }}
    >
      <button
        onClick={onBack}
        disabled={cur === 0}
        className="rounded-md border px-4 py-2 text-sm font-semibold transition disabled:opacity-40"
        style={{
          borderColor: "var(--warm-gray)",
          color: "var(--foundation)",
          backgroundColor: "transparent",
        }}
      >
        Back
      </button>
      <span
        className="hidden text-xs sm:block"
        style={{ color: "var(--muted-foreground)" }}
      >
        {!canAdvance && !last && "Complete this step to continue"}
      </span>
      <button
        onClick={onNext}
        disabled={!canAdvance && !last}
        className="rounded-md px-5 py-2 text-sm font-semibold transition disabled:opacity-40"
        style={{
          backgroundColor: "var(--deep)",
          color: "#fff",
        }}
      >
        {label}
      </button>
    </div>
  );
}

// ----- Gates: which screens require an interaction to advance -----
function gate(
  screen: Screen,
  s: ReturnType<typeof useModuleState>["state"],
): boolean {
  switch (screen) {
    case "activate":
      return s.hookWho.trim().length > 0 && s.confidencePre !== null;
    case "self":
      return s.selfStyle !== null;
    case "sort":
      return Object.keys(s.sortAnswers).length >= 16;
    case "match":
      return STYLE_ORDER.every((k) => s.matchAnswers[k] !== null);
    case "spot":
      return STYLE_ORDER.every((k, i) => s.emailAnswers[i] !== undefined);
    case "rewriter":
      return STYLE_ORDER.every((k) => (s.rewriter[k]?.score ?? 0) >= 3);
    case "scenario":
      return s.scenarioChoices.length >= JORDAN_SCENARIO.length;
    case "team":
      return s.team.length >= 1; // encouraged: 3-5, minimum 1 to continue
    case "capstone":
      return (
        s.targetStyle !== null &&
        s.capstoneDraft.trim().length >= 20 &&
        (s.capstoneCoach !== null || s.capstoneDraft.trim().length >= 20)
      );
    case "transfer":
      // Learners who want to keep the suggested wording shouldn't be blocked —
      // the default commitment (auto-seeded on the transfer screen) is enough.
      return s.commitment.trim().length > 0;
    case "post":
      return s.confidencePost !== null;
    default:
      return true;
  }
}

// ----- The dispatcher -----
function ScreenView({
  screen,
  state,
  update,
  goTo,
}: {
  screen: Screen;
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
  goTo: (n: number) => void;
}) {
  switch (screen) {
    case "welcome":
      return <WelcomeScreen onStart={() => goTo(1)} />;
    case "activate":
      return <ActivateScreen state={state} update={update} />;
    case "why":
      return <WhyScreen />;
    case "concept":
      return <ConceptScreen />;
    case "self":
      return <SelfScreen state={state} update={update} />;
    case "sort":
      return <SortScreen state={state} update={update} />;
    case "match":
      return <MatchScreen state={state} update={update} />;
    case "spot":
      return <SpotScreen state={state} update={update} />;
    case "rewriter":
      return <RewriterScreen state={state} update={update} />;
    case "scenario":
      return <ScenarioScreen state={state} update={update} />;
    case "team":
      return <TeamScreen state={state} update={update} />;
    case "capstone":
      return <CapstoneScreen state={state} update={update} />;
    case "transfer":
      return <TransferScreen state={state} update={update} />;
    case "post":
      return <PostScreen state={state} update={update} />;
    case "recap":
      return <RecapScreen state={state} />;
  }
}

// ----- Reusable UI bits -----
function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-3 text-3xl leading-tight sm:text-4xl">{children}</h1>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-2xl leading-tight sm:text-3xl">{children}</h2>;
}
function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-6 text-base sm:text-lg"
      style={{ color: "var(--muted-foreground)" }}
    >
      {children}
    </p>
  );
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 sm:p-6 ${className}`}
      style={{
        borderColor: "var(--warm-gray)",
        boxShadow: "var(--shadow-brand)",
      }}
    >
      {children}
    </div>
  );
}
function StylePicker({
  value,
  onChange,
  label,
}: {
  value: StyleKey | null;
  onChange: (k: StyleKey) => void;
  label?: string;
}) {
  return (
    <StylePickerImpl value={value} onChange={onChange} label={label} />
  );
}
function CompletionBanner({ done, text }: { done: boolean; text: string }) {
  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-lg border p-3"
      style={{
        borderColor: done ? "var(--sonic)" : "var(--core)",
        backgroundColor: done ? "var(--sonic-soft)" : "var(--sky)",
        color: "var(--foundation)",
      }}
      role="status"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-bold"
        style={{ backgroundColor: done ? "var(--sonic)" : "var(--core)", color: "#fff" }}
      >
        {done ? "✓" : "…"}
      </span>
      <span className="text-sm">{text}</span>
    </div>
  );
}
function StylePickerImpl({ value, onChange, label }: { value: StyleKey | null; onChange: (k: StyleKey) => void; label?: string; }) {
  return (
    <div>
      {label && (
        <div
          className="mb-2 text-sm font-semibold"
          style={{ color: "var(--foundation)" }}
        >
          {label}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STYLE_ORDER.map((k) => {
          const s = STYLES[k];
          const active = value === k;
          return (
            <button
              key={k}
              onClick={() => onChange(k)}
              className="rounded-xl border p-3 text-left transition"
              style={{
                borderColor: active ? s.colorVar : "var(--warm-gray)",
                backgroundColor: active ? s.softVar : "#fff",
                boxShadow: active ? "var(--shadow-brand)" : "none",
              }}
            >
              <div
                className="mb-1 flex items-center gap-2 text-sm font-bold"
                style={{ color: "var(--foundation)" }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.colorVar }}
                />
                {s.name}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {s.tagline}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----- Screens -----

// Reusable "how this works" banner shown at the top of each activity so
// learners always know what to do next and what a good answer looks like.
function ActivityGuide({
  steps,
  example,
}: {
  steps: string[];
  example: string;
}) {
  return (
    <div
      className="mb-4 rounded-lg border-l-4 p-3 text-sm"
      style={{
        borderLeftColor: "var(--deep)",
        backgroundColor: "var(--sky)",
        color: "var(--foundation)",
      }}
      role="note"
      aria-label="How this activity works"
    >
      <div
        className="mb-1 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--deep)" }}
      >
        How this works
      </div>
      <ol className="ml-4 list-decimal space-y-0.5">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <div className="mt-2 text-xs" style={{ color: "var(--foreground)" }}>
        <b>Example:</b> <span className="italic">{example}</span>
      </div>
    </div>
  );
}

// Shared keyboard handler for a group of single-select buttons.
// Wrap the buttons' parent in role="radiogroup" and give each button
// role="radio" + aria-checked, then attach this to onKeyDown.
// Supports Arrow keys, Home, and End. Enter/Space still activate via native button.
function handleRadioGroupKey(e: React.KeyboardEvent<HTMLButtonElement>) {
  const key = e.key;
  if (
    key !== "ArrowRight" &&
    key !== "ArrowLeft" &&
    key !== "ArrowUp" &&
    key !== "ArrowDown" &&
    key !== "Home" &&
    key !== "End"
  ) {
    return;
  }
  e.preventDefault();
  const group = (e.currentTarget as HTMLElement).closest(
    '[role="radiogroup"]',
  ) as HTMLElement | null;
  if (!group) return;
  const radios = Array.from(
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
  ).filter((r) => !r.disabled);
  if (radios.length === 0) return;
  const cur = radios.indexOf(e.currentTarget);
  let next = cur;
  if (key === "ArrowRight" || key === "ArrowDown")
    next = (cur + 1) % radios.length;
  else if (key === "ArrowLeft" || key === "ArrowUp")
    next = (cur - 1 + radios.length) % radios.length;
  else if (key === "Home") next = 0;
  else if (key === "End") next = radios.length - 1;
  const target = radios[next];
  target.focus();
  target.click();
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
      <div>
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            borderColor: "var(--foundation)",
            color: "var(--foundation)",
          }}
        >
          Guided practice · 20 min
        </div>
        <H1>Communication styles for people leaders</H1>
        <Lead>
          Read the room. Flex your message. Send something that actually lands.
          You'll practice on a real person and leave with a message ready to
          send.
        </Lead>
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { n: "4", l: "styles you'll learn to read" },
            { n: "6", l: "hands-on practice reps" },
            { n: "1", l: "real message ready to send" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: "var(--warm-gray)" }}
            >
              <div
                className="font-serif text-3xl"
                style={{ color: "var(--foundation)" }}
              >
                {s.n}
              </div>
              <div
                className="mt-1 text-xs leading-snug"
                style={{ color: "var(--muted-foreground)" }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onStart}
          className="rounded-md px-6 py-3 text-base font-semibold shadow-brand"
          style={{ backgroundColor: "var(--deep)", color: "#fff" }}
        >
          Let's begin
        </button>
      </div>
      <Card className="lg:sticky lg:top-24">
        <div
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted-foreground)" }}
        >
          What you'll do
        </div>
        <ul className="space-y-3">
          {[
            "Learn the four styles in plain language",
            "Practice reading them in real messages and conversations",
            "Rewrite one bland message four ways",
            "Coach a 1:1 with a direct report through a branching scenario",
            "Map your team and get a per-person cheat sheet",
            "Write and coach a real message you'll send this week",
          ].map((item, i) => (
            <li key={item} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: "var(--sky)",
                  color: "var(--foundation)",
                }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm leading-snug"
                style={{ color: "var(--foreground)" }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ActivateScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  return (
    <div className="max-w-2xl">
      <H2>Bring someone real into the room</H2>
      <Lead>
        Pick one person on your team you struggle to reach — a message that
        didn't land, a conversation that felt off. You'll practice on them.
      </Lead>

      <Card className="mb-4">
        <label
          className="mb-1 block text-sm font-semibold"
          style={{ color: "var(--foundation)" }}
        >
          Who is this person? (first name or initial is fine)
        </label>
        <input
          value={state.hookWho}
          onChange={(e) => update({ hookWho: e.target.value })}
          placeholder="e.g., Marcus, or M."
          className="w-full rounded-md border px-3 py-2 text-base"
          style={{ borderColor: "var(--warm-gray)" }}
        />
        <label
          className="mt-4 mb-1 block text-sm font-semibold"
          style={{ color: "var(--foundation)" }}
        >
          What happened? (one or two sentences)
        </label>
        <textarea
          value={state.hookWhat}
          onChange={(e) => update({ hookWhat: e.target.value })}
          rows={3}
          placeholder="e.g., I sent a detailed plan and got a one-word reply. Felt like it never registered."
          className="w-full rounded-md border px-3 py-2 text-base"
          style={{ borderColor: "var(--warm-gray)" }}
        />
        <div
          className="mt-3 rounded-md border p-3 text-xs"
          style={{
            borderColor: "var(--sky)",
            backgroundColor: "var(--sky)",
            color: "var(--foundation)",
          }}
        >
          Nothing you type here leaves this screen. It's saved locally in your
          browser only.
        </div>
      </Card>

      <Card>
        <label
          className="mb-2 block text-sm font-semibold"
          style={{ color: "var(--foundation)" }}
        >
          Right now, how confident are you flexing your style?
        </label>
        <ConfidenceSlider
          value={state.confidencePre}
          onChange={(v) => update({ confidencePre: v })}
        />
      </Card>
    </div>
  );
}

function ConfidenceSlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value !== null && value >= n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="h-11 flex-1 rounded-md border text-sm font-bold transition"
              style={{
                borderColor: active ? "var(--deep)" : "var(--warm-gray)",
                backgroundColor: active ? "var(--deep)" : "#fff",
                color: active ? "#fff" : "var(--muted-foreground)",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div
        className="mt-2 flex justify-between text-xs"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span>Not confident</span>
        <span>Very confident</span>
      </div>
    </div>
  );
}

function WhyScreen() {
  return (
    <div className="max-w-2xl">
      <H2>When your message doesn't land, the cost is real</H2>
      <Lead>
        Most misfires aren't about what you said. They're about how the other
        person needed to hear it.
      </Lead>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard n="70%" label="of workplace mistakes trace back to poor communication" />
        <StatCard n="5x" label="more likely to disengage when a manager's style mismatches theirs" />
        <StatCard n="1 flex" label="per week is enough to change how a direct report experiences you" />
        <StatCard n="20 min" label="is all this takes to build the flex muscle" />
      </div>
    </div>
  );
}
function StatCard({ n, label }: { n: string; label: string }) {
  return (
    <div
      className="rounded-xl border bg-white p-4"
      style={{ borderColor: "var(--warm-gray)" }}
    >
      <div
        className="text-3xl font-bold"
        style={{ color: "var(--deep)", fontFamily: "var(--font-serif)" }}
      >
        {n}
      </div>
      <div
        className="mt-1 text-sm"
        style={{ color: "var(--foreground)" }}
      >
        {label}
      </div>
    </div>
  );
}

function ConceptScreen() {
  return (
    <div className="max-w-2xl">
      <H2>Two questions place every style</H2>
      <Lead>
        The DISC model boils down to how someone moves and what they focus on.
        Every person you work with sits somewhere on this grid.
      </Lead>
      <div
        className="rounded-2xl border bg-white p-5"
        style={{
          borderColor: "var(--warm-gray)",
          boxShadow: "var(--shadow-brand)",
        }}
      >
        <DiscGrid />
      </div>
      <div className="mt-6">
        <H2>What each style wants from you</H2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STYLE_ORDER.map((k) => (
            <div
              key={k}
              className="rounded-xl border p-4"
              style={{
                borderColor: STYLES[k].colorVar,
                backgroundColor: STYLES[k].softVar,
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <StyleBadge style={k} />
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--foreground)" }}
              >
                {STYLES[k].wants}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscGrid() {
  const cell = (k: StyleKey, label: string, sub: string) => (
    <div
      className="flex flex-col justify-between rounded-lg p-3"
      style={{
        backgroundColor: STYLES[k].softVar,
        border: `1px solid ${STYLES[k].colorVar}`,
      }}
    >
      <div
        className="text-sm font-bold"
        style={{ color: "var(--foundation)" }}
      >
        {STYLES[k].name}
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--foreground)" }}>
        {sub}
      </div>
      <div
        className="mt-2 text-xs italic"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </div>
    </div>
  );
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
        <span>← Task-focused</span>
        <span>People-focused →</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cell("d", "Fast · Task", "Direct, drives outcomes")}
        {cell("i", "Fast · People", "Warm, rallies the room")}
        {cell("c", "Slow · Task", "Precise, quality-first")}
        {cell("s", "Slow · People", "Calm, protects harmony")}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
        <span>↑ Fast-paced</span>
        <span>↓ Steady-paced</span>
      </div>
    </div>
  );
}

function SelfScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const s = state.selfStyle ? STYLES[state.selfStyle] : null;
  const stressShift: Record<StyleKey, { calm: string; pressure: string }> = {
    d: {
      calm: "Direct but open — asks for input, then decides.",
      pressure: "Cuts input short. Barks the ask. People feel run over.",
    },
    i: {
      calm: "Warm, storytelling, brings people along.",
      pressure: "Talks more, listens less. Overpromises to keep the mood up.",
    },
    s: {
      calm: "Steady presence. Protects the team's footing.",
      pressure: "Goes quiet. Says yes to buy peace, then resents it later.",
    },
    c: {
      calm: "Precise, thoughtful, catches what others miss.",
      pressure: "Retreats into detail. Delays a call that just needs making.",
    },
  };
  return (
    <div className="max-w-2xl">
      <H2>What's your default under pressure?</H2>
      <Lead>
        Not who you are on a good day — who you become when the deadline hits.
        There's no wrong answer.
      </Lead>
      <StylePicker
        value={state.selfStyle}
        onChange={(k) => update({ selfStyle: k })}
      />
      {s && (
        <Card className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div
                className="mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--sonic)" }}
              >
                The gift your style gives your team
              </div>
              <div className="text-sm">{s.gift}</div>
            </div>
            <div>
              <div
                className="mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--rucksack)" }}
              >
                The risk to watch
              </div>
              <div className="text-sm">{s.risk}</div>
            </div>
          </div>
          <div
            className="mt-4 grid gap-3 rounded-md border p-3 sm:grid-cols-2"
            style={{
              borderColor: "var(--warm-gray)",
              backgroundColor: "var(--off-white)",
            }}
          >
            <div>
              <div
                className="mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--core)" }}
              >
                On a calm day
              </div>
              <div className="text-sm">{stressShift[s.key].calm}</div>
            </div>
            <div>
              <div
                className="mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--rucksack)" }}
              >
                Under pressure
              </div>
              <div className="text-sm">{stressShift[s.key].pressure}</div>
            </div>
            <div
              className="sm:col-span-2 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              Most of us look like the left column most of the time. The
              stretch is noticing when we've shifted to the right — and coming
              back on purpose.
            </div>
          </div>
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--warm-gray)" }}>
            <label
              className="mb-1 block text-sm font-semibold"
              style={{ color: "var(--foundation)" }}
            >
              Take a second — {s.reflection}
            </label>
            <textarea
              value={state.selfReflection}
              onChange={(e) => update({ selfReflection: e.target.value })}
              rows={2}
              placeholder="Just for you — nothing leaves this screen."
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--warm-gray)" }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

// Traits pool for sort activity
const ALL_TRAITS: Array<{ trait: string; style: StyleKey }> = STYLE_ORDER.flatMap(
  (k) => STYLES[k].traits.map((t) => ({ trait: t, style: k })),
);

function SortScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const [checked, setChecked] = useState(false);
  const answered = Object.keys(state.sortAnswers).length;
  const total = ALL_TRAITS.length;

  const setTrait = (trait: string, k: StyleKey) => {
    update({ sortAnswers: { ...state.sortAnswers, [trait]: k } });
  };
  const correct = ALL_TRAITS.filter(
    (t) => state.sortAnswers[t.trait] === t.style,
  ).length;

  return (
    <div>
      <H2>Pick the style that best matches each trait</H2>
      <Lead>
        A quick warm-up. For each trait below, tap the style it fits best
        (D = Dominant, I = Influencer, S = Steady, C = Conscientious).
      </Lead>
      <ActivityGuide
        steps={[
          "Read each trait word on the left.",
          "Pick the letter that best fits: D, I, S, or C.",
          "Answer all 16, then tap Check answers.",
        ]}
        example='"Blunt" → D (Dominant). Dominant readers speak short and direct — bluntness is their signature.'
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_TRAITS.map(({ trait, style }) => {
          const picked = state.sortAnswers[trait];
          const isRight = picked === style;
          return (
            <div
              key={trait}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-3"
              style={{
                borderColor: checked
                  ? isRight
                    ? "var(--sonic)"
                    : "var(--rucksack)"
                  : "var(--warm-gray)",
              }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--foundation)" }}>
                {trait}
              </span>
              <div
                className="flex flex-wrap gap-1.5"
                role="radiogroup"
                aria-label={`Pick a style for ${trait}`}
              >
                {STYLE_ORDER.map((k) => {
                  const active = picked === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setTrait(trait, k)}
                      onKeyDown={handleRadioGroupKey}
                      role="radio"
                      aria-checked={active}
                      tabIndex={active || (!picked && k === STYLE_ORDER[0]) ? 0 : -1}
                      aria-label={`Mark ${trait} as ${STYLES[k].name}`}
                      className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                      style={{
                        borderColor: active
                          ? STYLES[k].colorVar
                          : "var(--warm-gray)",
                        backgroundColor: active ? STYLES[k].softVar : "#fff",
                        color: "var(--foundation)",
                      }}
                    >
                      {STYLES[k].name[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {answered}/{total} sorted
        </span>
        <button
          disabled={answered < total}
          onClick={() => setChecked(true)}
          className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{
            borderColor: "var(--foundation)",
            color: "var(--foundation)",
          }}
        >
          Check answers
        </button>
      </div>
      {checked && (
        <div
          className="mt-3 rounded-md p-3 text-sm"
          style={{
            backgroundColor: "var(--sky)",
            color: "var(--foundation)",
          }}
        >
          {correct} of {total} correct.{" "}
          {correct === total
            ? "Clean sweep. Move on."
            : "Look for the reds — swap them, then continue."}
        </div>
      )}
    </div>
  );
}

function MatchScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const [checked, setChecked] = useState(false);
  const set = (k: StyleKey, blindStyle: StyleKey) => {
    update({ matchAnswers: { ...state.matchAnswers, [k]: blindStyle } });
  };
  const allAnswered = STYLE_ORDER.every((k) => state.matchAnswers[k] !== null);
  return (
    <div className="max-w-2xl">
      <H2>Find each style's blind spot</H2>
      <Lead>
        Every strength has a downside. You'll see four styles below. Under each
        one, pick the sentence that describes the trap that style tends to fall
        into. One answer per style. Example: the Dominant style's blind spot is
        moving so fast that people feel run over.
      </Lead>
      <ActivityGuide
        steps={[
          "Look at the style at the top of each card.",
          "Read the four blind-spot sentences under it.",
          "Pick the one sentence that fits that style best.",
          "Do all four, then tap Check answers.",
        ]}
        example='Under Steady, "Says yes when they mean not yet" is the blind spot — Steady types avoid friction and defer too long.'
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {STYLE_ORDER.map((k) => (
          <div
            key={k}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: "var(--warm-gray)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <StyleBadge style={k} />
            </div>
            <div
              className="grid gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label={`Pick the blind spot for ${STYLES[k].name}`}
            >
              {STYLE_ORDER.map((bk) => {
                const active = state.matchAnswers[k] === bk;
                const right = checked && bk === k;
                const wrong = checked && active && bk !== k;
                return (
                  <button
                    key={bk}
                    onClick={() => set(k, bk)}
                    onKeyDown={handleRadioGroupKey}
                    role="radio"
                    aria-checked={active}
                    tabIndex={
                      active ||
                      (state.matchAnswers[k] === null && bk === STYLE_ORDER[0])
                        ? 0
                        : -1
                    }
                    aria-label={`For ${STYLES[k].name}: ${STYLES[bk].blindSpot}`}
                    className="rounded-md border px-3 py-2 text-left text-sm"
                    style={{
                      borderColor: right
                        ? "var(--sonic)"
                        : wrong
                          ? "var(--rucksack)"
                          : active
                            ? "var(--deep)"
                            : "var(--warm-gray)",
                      backgroundColor: active ? "var(--sky)" : "#fff",
                      color: "var(--foundation)",
                    }}
                  >
                    {STYLES[bk].blindSpot}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          disabled={!allAnswered}
          onClick={() => setChecked(true)}
          className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{
            borderColor: "var(--foundation)",
            color: "var(--foundation)",
          }}
        >
          Check answers
        </button>
      </div>
    </div>
  );
}

function SpotScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const [idx, setIdx] = useState(0);
  const email = SAMPLE_EMAILS[idx];
  const picked = state.emailAnswers[idx];

  return (
    <div className="max-w-2xl">
      <H2>Read the email. Name the style.</H2>
      <Lead>
        {idx + 1} of {SAMPLE_EMAILS.length} — trust your gut, then check the
        tell.
      </Lead>
      <Card>
        <div
          className="mb-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted-foreground)" }}
        >
          From
        </div>
        <div className="text-sm font-semibold" style={{ color: "var(--foundation)" }}>
          {email.from}
        </div>
        <div
          className="mt-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted-foreground)" }}
        >
          Subject
        </div>
        <div className="text-sm font-semibold" style={{ color: "var(--foundation)" }}>
          {email.subject}
        </div>
        <div
          className="mt-3 rounded-md p-3 text-sm"
          style={{ backgroundColor: "var(--off-white)" }}
        >
          {email.body}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STYLE_ORDER.map((k) => {
            const active = picked === k;
            const isRight = picked !== undefined && k === email.answer;
            const isWrong = active && k !== email.answer;
            return (
              <button
                key={k}
                onClick={() =>
                  update({
                    emailAnswers: { ...state.emailAnswers, [idx]: k },
                  })
                }
                disabled={picked !== undefined}
                className="rounded-md border px-3 py-2 text-sm font-semibold"
                style={{
                  borderColor: isRight
                    ? "var(--sonic)"
                    : isWrong
                      ? "var(--rucksack)"
                      : active
                        ? "var(--deep)"
                        : "var(--warm-gray)",
                  backgroundColor: isRight
                    ? "var(--sonic-soft)"
                    : isWrong
                      ? "var(--rucksack-soft)"
                      : "#fff",
                  color: "var(--foundation)",
                }}
              >
                {STYLES[k].name}
              </button>
            );
          })}
        </div>
        {picked !== undefined && (
          <div
            className="mt-3 rounded-md p-3 text-sm"
            style={{
              backgroundColor: "var(--sky)",
              color: "var(--foundation)",
            }}
          >
            <b>Tell:</b> {email.tell}
          </div>
        )}
      </Card>
      <div className="mt-4 flex justify-between">
        <button
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
          style={{ borderColor: "var(--warm-gray)", color: "var(--foundation)" }}
        >
          Previous
        </button>
        <button
          disabled={picked === undefined || idx === SAMPLE_EMAILS.length - 1}
          onClick={() => setIdx((i) => Math.min(SAMPLE_EMAILS.length - 1, i + 1))}
          className="rounded-md border px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
          style={{ borderColor: "var(--foundation)", color: "var(--foundation)" }}
        >
          Next email
        </button>
      </div>
    </div>
  );
}

function RewriterScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  // Resume on the first incomplete style so returners land where there's work left.
  const firstIncomplete = STYLE_ORDER.find(
    (k) => (state.rewriter[k]?.score ?? 0) < 3,
  );
  const [active, setActive] = useState<StyleKey>(firstIncomplete ?? "d");
  const [draft, setDraft] = useState(state.rewriter[active]?.draft ?? "");
  const [loading, setLoading] = useState(false);
  const coach = useServerFn(coachMessage);

  useEffect(() => {
    setDraft(state.rewriter[active]?.draft ?? "");
  }, [active, state.rewriter]);

  const runCoach = async () => {
    if (draft.trim().length < 10) return;
    setLoading(true);
    try {
      const res = await coach({
        data: {
          targetStyle: active,
          message: draft,
          mode: "rewriter",
        },
      });
      update({
        rewriter: {
          ...state.rewriter,
          [active]: {
            score: res.score,
            hits: res.hits,
            misses: res.misses,
            feedback: res.feedback,
            suggestion: res.suggestion,
            draft,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const entry = state.rewriter[active];
  const doneCount = STYLE_ORDER.filter(
    (k) => (state.rewriter[k]?.score ?? 0) >= 3,
  ).length;
  const allDone = doneCount === STYLE_ORDER.length;
  const activeDone = (entry?.score ?? 0) >= 3;
  const doneStyles = STYLE_ORDER.filter(
    (k) => (state.rewriter[k]?.score ?? 0) >= 3,
  );
  return (
    <div className="max-w-2xl">
      <H2>Rewrite one message four ways</H2>
      <Lead>
        Same ask, four readers. Pick a style tab, rewrite the message below so
        it sounds like that style, then tap <b>Get feedback</b>. Land 3 of 5
        tells for each style to finish.
      </Lead>
      <ActivityGuide
        steps={[
          "Pick a style tab (Dominant, Influencer, Steady, or Conscientious).",
          "Rewrite the bland message so it sounds like that style. Aim for the 5 tells shown.",
          "Tap Get feedback — AI scores how many tells you landed and suggests a rewrite.",
          "Land at least 3 of 5 for each style to finish.",
        ]}
        example={`For Dominant, try: "Deadline moved up. Need your piece by Wed EOD. Two options if that's tight — reply which one works." Short, direct, deadline first.`}
      />
      {doneCount > 0 && (
        <CompletionBanner
          done={allDone}
          text={
            allDone
              ? "All four rewrites landed. Tap any tab to review your work — nothing gets erased."
              : `You've already finished ${doneCount} of 4 rewrites. Completed tabs show a check — feel free to open one to reread your feedback.`
          }
        />
      )}
      {doneCount > 0 && !allDone && (
        <div
          className="mb-3 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span className="font-semibold" style={{ color: "var(--foundation)" }}>
            Already finished:
          </span>{" "}
          {doneStyles
            .map((k) => `${STYLES[k].name} (${state.rewriter[k]?.score}/5)`)
            .join(" · ")}
        </div>
      )}
      <Card className="mb-4">
        <div
          className="mb-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted-foreground)" }}
        >
          Bland source message
        </div>
        <div className="text-sm italic" style={{ color: "var(--foundation)" }}>
          "{BLAND_SOURCE_MESSAGE}"
        </div>
      </Card>

      <div className="mb-3 flex flex-wrap gap-2">
        {STYLE_ORDER.map((k) => {
          const done = (state.rewriter[k]?.score ?? 0) >= 3;
          const isActive = k === active;
          return (
            <button
              key={k}
              onClick={() => setActive(k)}
              aria-label={
                done
                  ? `${STYLES[k].name} — completed`
                  : `${STYLES[k].name} — not yet completed`
              }
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold"
              style={{
                borderColor: isActive
                  ? STYLES[k].colorVar
                  : done
                    ? "var(--sonic)"
                    : "var(--warm-gray)",
                backgroundColor: isActive
                  ? STYLES[k].softVar
                  : done
                    ? "var(--sonic-soft)"
                    : "#fff",
                color: "var(--foundation)",
              }}
            >
              {done && (
                <span
                  aria-hidden="true"
                  className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: "var(--sonic)", color: "#fff" }}
                >
                  ✓
                </span>
              )}
              {STYLES[k].name}
            </button>
          );
        })}
      </div>

      <Card>
        <div
          className="mb-1 text-sm font-semibold"
          style={{ color: "var(--foundation)" }}
        >
          Rewrite for a {STYLES[active].name} reader
        </div>
        <div
          className="mb-3 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          {STYLES[active].tagline}
        </div>
        {activeDone && (
          <div
            className="mb-3 flex items-start gap-2 rounded-md border p-2 text-xs"
            style={{
              borderColor: "var(--sonic)",
              backgroundColor: "var(--sonic-soft)",
              color: "var(--foundation)",
            }}
            role="status"
          >
            <span
              aria-hidden="true"
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: "var(--sonic)", color: "#fff" }}
            >
              ✓
            </span>
            <span>
              <b>Already completed</b> — you landed {entry?.score}/5 tells for{" "}
              {STYLES[active].name}. Your last draft and feedback are here. Edit
              and tap <b>Get feedback</b> again to try a new take.
            </span>
          </div>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder="Type your rewrite here..."
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--warm-gray)" }}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Aim for the 5 tells: {STYLES[active].tells.join(" · ")}
          </span>
          <button
            onClick={runCoach}
            disabled={loading || draft.trim().length < 10}
            className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: "var(--deep)", color: "#fff" }}
          >
            {loading ? "Coaching…" : "Get feedback"}
          </button>
        </div>
        {entry && (
          <div
            className="mt-4 rounded-md p-3 text-sm"
            style={{
              backgroundColor:
                entry.score >= 3 ? "var(--sonic-soft)" : "var(--rucksack-soft)",
              color: "var(--foundation)",
            }}
          >
            <div className="mb-1 font-semibold">
              {entry.score}/5 tells landed
            </div>
            <div className="mb-2">{entry.feedback}</div>
            {entry.misses.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider">
                  Missed
                </div>
                <ul className="ml-4 list-disc">
                  {entry.misses.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {entry.suggestion && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider">
                  Suggested rewrite
                </div>
                <div className="mt-1 italic">"{entry.suggestion}"</div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function ScenarioScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const stepIdx = Math.min(state.scenarioChoices.length, JORDAN_SCENARIO.length - 1);
  const inProgress = state.scenarioChoices.length < JORDAN_SCENARIO.length;
  const step = JORDAN_SCENARIO[stepIdx];
  const lastChoice =
    !inProgress || state.scenarioChoices.length > 0
      ? state.scenarioChoices[state.scenarioChoices.length - 1]
      : null;

  return (
    <div className="max-w-2xl">
      <H2>1:1 with Jordan</H2>
      <Lead>
        Jordan is a Steady-style direct report. Since the reorg, they've gone
        quiet. You have this conversation to bring them back into the room.
      </Lead>
      <ActivityGuide
        steps={[
          "Read what Jordan says at each scene.",
          "Pick one reply. Use Tab to reach the choices and Arrow keys to move between them.",
          "See how Jordan reacts, what style your reply signaled, and how a stronger flex would sound.",
          "Finish all 3 scenes. Replay any time to try a different mix.",
        ]}
        example={`If Jordan says "I'm fine, just tired," a warm acknowledgment ("Thanks for saying so — anything from my side making it heavier?") lands better than jumping to solutions.`}
      />

      {!inProgress && (
        <CompletionBanner
          done
          text="You finished this conversation. Your choices and feedback are below — replay any time to try a different mix."
        />
      )}
      {inProgress && state.scenarioChoices.length > 0 && (
        <CompletionBanner
          done={false}
          text={`Picking up at Scene ${stepIdx + 1} of ${JORDAN_SCENARIO.length}. Your ${state.scenarioChoices.length} earlier ${state.scenarioChoices.length === 1 ? "choice is" : "choices are"} shown below with feedback — the next scene is at the bottom.`}
        />
      )}

      {state.scenarioChoices.map((choiceIdx, i) => {
        const s = JORDAN_SCENARIO[i];
        const c = s.choices[choiceIdx];
        return (
          <div key={i} className="mb-3 space-y-2">
            <div
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--sonic)" }}
            >
              <span
                aria-hidden="true"
                className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: "var(--sonic)", color: "#fff" }}
              >
                ✓
              </span>
              Scene {i + 1} of {JORDAN_SCENARIO.length} — completed
            </div>
            <div
              className="rounded-lg p-3 text-sm italic"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
              }}
            >
              Jordan: "{s.jordan}"
            </div>
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                backgroundColor: "var(--sky)",
                color: "var(--foundation)",
              }}
            >
              You: "{c.reply}"
            </div>
            <FeedbackBox choice={c} />
          </div>
        );
      })}

      {inProgress && (
        <Card className="mt-4">
          <div
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            Scene {stepIdx + 1} of {JORDAN_SCENARIO.length}
          </div>
          <div
            className="mb-3 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {step.setup}
          </div>
          <div
            className="mb-4 rounded-lg p-3 text-sm italic"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
            }}
          >
            Jordan: "{step.jordan}"
          </div>
          <div
            className="space-y-2"
            role="radiogroup"
            aria-label={`Scene ${stepIdx + 1} choices`}
          >
            {step.choices.map((c, i) => (
              <button
                key={i}
                onClick={() =>
                  update({ scenarioChoices: [...state.scenarioChoices, i] })
                }
                onKeyDown={handleRadioGroupKey}
                role="radio"
                aria-checked={false}
                tabIndex={i === 0 ? 0 : -1}
                className="block w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:border-[var(--deep)]"
                style={{
                  borderColor: "var(--warm-gray)",
                  backgroundColor: "#fff",
                  color: "var(--foundation)",
                }}
              >
                <div className="font-semibold">{c.label}</div>
                <div
                  className="mt-0.5 text-xs italic"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  "{c.reply}"
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {!inProgress && (
        <>
          <ScenarioSummary choices={state.scenarioChoices} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => update({ scenarioChoices: [] })}
              className="rounded-md border px-3 py-1.5 text-sm font-semibold"
              style={{
                borderColor: "var(--foundation)",
                color: "var(--foundation)",
              }}
            >
              Replay scenario
            </button>
            <span
              className="text-xs"
              style={{ color: "var(--muted-foreground)", alignSelf: "center" }}
            >
              Try a different mix and see how Jordan reacts.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ScenarioSummary({ choices }: { choices: number[] }) {
  const styleCounts: Record<StyleKey, number> = { d: 0, i: 0, s: 0, c: 0 };
  let wells = 0;
  let poors = 0;
  choices.forEach((choiceIdx, i) => {
    const c = JORDAN_SCENARIO[i].choices[choiceIdx];
    styleCounts[c.style] += 1;
    if (c.landed === "well") wells += 1;
    if (c.landed === "poorly") poors += 1;
  });
  const topStyle = (Object.keys(styleCounts) as StyleKey[]).reduce((a, b) =>
    styleCounts[a] >= styleCounts[b] ? a : b,
  );
  const topCount = styleCounts[topStyle];
  const total = choices.length;
  const takeaway =
    wells === total
      ? "You matched Jordan's register on every turn. That's the flex."
      : wells >= 2
        ? "Strong session. Where you didn't land well, watch how a quieter, more Steady tone changes what Jordan gives you."
        : poors >= 2
          ? "You defaulted to your own style more than Jordan needed. Try again — this time acknowledge the person before the task at every turn."
          : "Mixed session. Replay it and try leading with acknowledgment before you bring structure or pace.";
  return (
    <Card className="mt-4">
      <div
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)" }}
      >
        Your pattern this run
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        {STYLE_ORDER.map((k) => (
          <div
            key={k}
            className="rounded-md border p-2 text-center"
            style={{
              borderColor:
                k === topStyle && topCount > 0
                  ? STYLES[k].colorVar
                  : "var(--warm-gray)",
              backgroundColor:
                k === topStyle && topCount > 0 ? STYLES[k].softVar : "#fff",
            }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: "var(--foundation)" }}
            >
              {styleCounts[k]}
            </div>
            <div
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              {STYLES[k].name}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mb-2 text-sm"
        style={{ color: "var(--foreground)" }}
      >
        <b>Landed well:</b> {wells}/{total} &nbsp;·&nbsp; <b>Landed poorly:</b>{" "}
        {poors}/{total}
      </div>
      <div className="text-sm" style={{ color: "var(--foundation)" }}>
        {takeaway}
      </div>
    </Card>
  );
}

function FeedbackBox({
  choice,
}: {
  choice: (typeof JORDAN_SCENARIO)[number]["choices"][number];
}) {
  const color =
    choice.landed === "well"
      ? "var(--sonic)"
      : choice.landed === "ok"
        ? "var(--origin)"
        : "var(--rucksack)";
  const soft =
    choice.landed === "well"
      ? "var(--sonic-soft)"
      : choice.landed === "ok"
        ? "var(--origin-soft)"
        : "var(--rucksack-soft)";
  return (
    <div
      className="rounded-lg border p-3 text-sm"
      style={{ borderColor: color, backgroundColor: soft, color: "var(--foundation)" }}
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        <StyleBadge style={choice.style} size="sm" />
        <span>Landed {choice.landed}</span>
      </div>
      <div className="mb-1">
        <b>What Jordan does:</b> {choice.reaction}
      </div>
      <div>
        <b>Coach:</b> {choice.coach}
      </div>
    </div>
  );
}

function TeamScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const [name, setName] = useState("");
  const [style, setStyle] = useState<StyleKey | null>(null);
  const add = () => {
    if (!name.trim() || !style) return;
    update({
      team: [
        ...state.team,
        { id: `${Date.now()}`, name: name.trim(), style },
      ],
    });
    setName("");
    setStyle(null);
  };
  const remove = (id: string) =>
    update({ team: state.team.filter((m) => m.id !== id) });

  return (
    <div className="max-w-2xl">
      <H2>Map your team</H2>
      <Lead>
        Add 3–5 real people you lead. For each, pick the style they read like
        under pressure. You'll get a cheat sheet for your next 1:1 with each.
      </Lead>

      <Card className="mb-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name or initial"
            className="rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--warm-gray)" }}
          />
          <button
            onClick={add}
            disabled={!name.trim() || !style}
            className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: "var(--deep)", color: "#fff" }}
          >
            Add
          </button>
        </div>
        <div className="mt-3">
          <StylePicker value={style} onChange={setStyle} />
        </div>
      </Card>

      {state.team.length === 0 ? (
        <div
          className="rounded-md border border-dashed p-6 text-center text-sm"
          style={{
            borderColor: "var(--warm-gray)",
            color: "var(--muted-foreground)",
          }}
        >
          Your team map is empty. Add one person to continue.
        </div>
      ) : (
        <>
          <div id="team-print" className="space-y-3">
            {state.team.map((m) => (
              <TeamCard key={m.id} member={m} onRemove={() => remove(m.id)} />
            ))}
          </div>
          <div className="mt-4 flex justify-end print:hidden">
            <button
              onClick={() => window.print()}
              className="rounded-md border px-4 py-2 text-sm font-semibold"
              style={{
                borderColor: "var(--foundation)",
                color: "var(--foundation)",
              }}
            >
              Print my team map
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TeamCard({
  member,
  onRemove,
}: {
  member: { id: string; name: string; style: StyleKey };
  onRemove: () => void;
}) {
  const s = STYLES[member.style];
  return (
    <div
      className="rounded-xl border bg-white p-4"
      style={{ borderColor: "var(--warm-gray)" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className="text-lg font-bold"
          style={{ color: "var(--foundation)", fontFamily: "var(--font-serif)" }}
        >
          {member.name}
        </div>
        <div className="flex items-center gap-2">
          <StyleBadge style={member.style} size="sm" />
          <button
            onClick={onRemove}
            className="text-xs underline"
            style={{ color: "var(--muted-foreground)" }}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <CheatCell
          label="Open with"
          text={openerFor(member.style)}
        />
        <CheatCell
          label="Avoid"
          text={STYLES[member.style].blindSpot + " Don't lead with it."}
        />
        <CheatCell label="Feedback style" text={feedbackFor(member.style)} />
      </div>
      <div
        className="mt-3 text-xs italic"
        style={{ color: "var(--muted-foreground)" }}
      >
        What {member.name} wants from you: {s.wants.toLowerCase()}
      </div>
    </div>
  );
}
function CheatCell({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div
        className="mb-1 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </div>
      <div className="text-sm" style={{ color: "var(--foreground)" }}>
        {text}
      </div>
    </div>
  );
}
function openerFor(k: StyleKey) {
  return {
    d: "The headline. \"Here's the ask, here's the deadline.\"",
    i: "A shared moment. \"Hey — how was the weekend?\" Then the ask.",
    s: "Them, before the task. \"How are you holding up?\" Wait for a real answer.",
    c: "The context. \"Here's what we know, here's the question I need help on.\"",
  }[k];
}
function feedbackFor(k: StyleKey) {
  return {
    d: "Direct, in-person, no cushion. State the impact and the fix.",
    i: "Warm, in-person, private. Frame around growth, not correction.",
    s: "Private, patient, over a couple of touches. Give them time.",
    c: "Written first, with examples and criteria. Then discuss.",
  }[k];
}

function CapstoneScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const [loading, setLoading] = useState(false);
  const [rubricMode, setRubricMode] = useState(false);
  const [rubricChecks, setRubricChecks] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const coach = useServerFn(coachMessage);
  const who = state.hookWho || "them";

  const run = async () => {
    if (!state.targetStyle || state.capstoneDraft.trim().length < 20) return;
    setLoading(true);
    try {
      const res = await coach({
        data: {
          targetStyle: state.targetStyle,
          message: state.capstoneDraft,
          context: state.hookWhat || undefined,
          mode: "capstone",
        },
      });
      update({
        capstoneCoach: {
          score: res.score,
          hits: res.hits,
          misses: res.misses,
          feedback: res.feedback,
          suggestion: res.suggestion,
          draft: state.capstoneDraft,
        },
      });
      if (!res.ok) setRubricMode(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <H2>Now write the message that lands</H2>
      <Lead>
        Back to {who} from the start. A project deadline just moved up — you
        need them to re-prioritize and get their piece to you two days early.
        Write the message the way <b>{who}</b> will actually receive it.
      </Lead>

      <Card className="mb-4">
        <StylePicker
          value={state.targetStyle}
          onChange={(k) => update({ targetStyle: k })}
          label={`Which style best fits ${who}?`}
        />
      </Card>

      {state.targetStyle && (
        <Card>
          <label
            className="mb-1 block text-sm font-semibold"
            style={{ color: "var(--foundation)" }}
          >
            Your message to {who}
          </label>
          <textarea
            value={state.capstoneDraft}
            onChange={(e) => update({ capstoneDraft: e.target.value })}
            rows={7}
            placeholder="Type the actual message you'd send..."
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--warm-gray)" }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setRubricMode((v) => !v)}
              className="text-xs underline"
              style={{ color: "var(--muted-foreground)" }}
            >
              {rubricMode ? "Use AI coach instead" : "Prefer to self-check with a rubric?"}
            </button>
            {!rubricMode && (
              <button
                onClick={run}
                disabled={loading || state.capstoneDraft.trim().length < 20}
                className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: "var(--deep)", color: "#fff" }}
              >
                {loading ? "Coaching…" : "Get coaching on my message"}
              </button>
            )}
          </div>

          {rubricMode && state.targetStyle && (
            <div className="mt-4">
              <div
                className="mb-2 text-sm font-semibold"
                style={{ color: "var(--foundation)" }}
              >
                Check the tells your message hits:
              </div>
              <ul className="space-y-1.5">
                {STYLES[state.targetStyle].tells.map((t, i) => (
                  <li key={i}>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={rubricChecks.has(i)}
                        onChange={(e) => {
                          const next = new Set(rubricChecks);
                          if (e.target.checked) next.add(i);
                          else next.delete(i);
                          setRubricChecks(next);
                          if (next.size >= 3) {
                            update({
                              capstoneCoach: {
                                score: next.size,
                                hits: Array.from(next).map(
                                  (n) => STYLES[state.targetStyle!].tells[n],
                                ),
                                misses: STYLES[state.targetStyle!].tells.filter(
                                  (_, idx) => !next.has(idx),
                                ),
                                feedback:
                                  "Self-check locked in. Read once more out loud before you send.",
                                suggestion: "",
                                draft: state.capstoneDraft,
                              },
                            });
                          }
                        }}
                      />
                      <span>{t}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.capstoneCoach && !rubricMode && (
            <div
              className="mt-4 rounded-md p-3 text-sm"
              style={{
                backgroundColor:
                  state.capstoneCoach.score >= 3
                    ? "var(--sonic-soft)"
                    : "var(--rucksack-soft)",
                color: "var(--foundation)",
              }}
            >
              <div className="mb-1 font-semibold">
                {state.capstoneCoach.score}/5 tells landed
              </div>
              <div className="mb-2">{state.capstoneCoach.feedback}</div>
              {state.capstoneCoach.suggestion && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider">
                    Suggested rewrite
                  </div>
                  <div className="mt-1 italic">
                    "{state.capstoneCoach.suggestion}"
                  </div>
                </div>
              )}
            </div>
          )}

          {state.capstoneDraft.trim().length >= 20 && (
            <div
              className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4"
              style={{ borderColor: "var(--warm-gray)" }}
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(state.capstoneDraft);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-md px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: "var(--foundation)", color: "#fff" }}
              >
                {copied ? "Copied — paste it now" : "Copy message"}
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent("Quick note")}&body=${encodeURIComponent(state.capstoneDraft)}`}
                className="rounded-md border px-4 py-2 text-sm font-semibold"
                style={{
                  borderColor: "var(--foundation)",
                  color: "var(--foundation)",
                }}
              >
                Open in email
              </a>
              <span
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Send it before you close this tab. Momentum matters.
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function TransferScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const who = state.hookWho || "someone on your team";
  const styleName = state.targetStyle
    ? STYLES[state.targetStyle].name
    : "their";
  const defaultCommit = `Send my ${styleName}-flexed message to ${who} within 48 hours, then check in one week later.`;

  // Pre-fill the commitment so learners can accept the suggested wording with
  // one click — they can still edit it, and Continue isn't blocked on typing.
  useEffect(() => {
    if (!state.commitment.trim()) {
      update({ commitment: defaultCommit });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = () => {
    const flex = state.targetStyle
      ? `Lead with what a ${styleName} reader needs: ${STYLES[state.targetStyle].tells[0].toLowerCase()}.`
      : "Try one flex from your module take-aways.";
    const ics = buildReminderIcs({
      who,
      flex,
      commitment: state.commitment || defaultCommit,
    });
    downloadIcs(`flex-with-${who.replace(/\s+/g, "-").toLowerCase()}.ics`, ics);
    update({ reminderDownloaded: true });
  };

  const downloadCheckIn = () => {
    const flex = state.targetStyle
      ? `Reflect: how did your ${styleName}-flex land with ${who}? What shifted?`
      : `Reflect: how did your flex with ${who} go? What shifted?`;
    const ics = buildReminderIcs({
      who,
      flex,
      commitment: state.commitment || defaultCommit,
      daysFromNow: 30,
    });
    downloadIcs(
      `flex-checkin-${who.replace(/\s+/g, "-").toLowerCase()}.ics`,
      ics,
    );
  };

  return (
    <div className="max-w-2xl">
      <H2>Your 7-day flex</H2>
      <Lead>
        One person. One flex. This week. Write it in your own words, then drop
        a reminder into your calendar so future-you actually does it.
      </Lead>
      <Card>
        <label
          className="mb-1 block text-sm font-semibold"
          style={{ color: "var(--foundation)" }}
        >
          Your commitment
        </label>
        <textarea
          value={state.commitment}
          onChange={(e) => update({ commitment: e.target.value })}
          rows={3}
          placeholder={defaultCommit}
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--warm-gray)" }}
        />
        <button
          onClick={download}
          className="mt-3 rounded-md px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: "var(--deep)", color: "#fff" }}
        >
          {state.reminderDownloaded ? "Downloaded — download again" : "Remind me in 7 days (.ics)"}
        </button>
        <button
          onClick={downloadCheckIn}
          className="ml-2 mt-3 rounded-md border px-4 py-2 text-sm font-semibold"
          style={{
            borderColor: "var(--foundation)",
            color: "var(--foundation)",
          }}
        >
          Add a 30-day check-in
        </button>
        <div
          className="mt-2 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          Both open in Outlook, Google Calendar, or Apple Calendar. The 7-day
          nudges you to try it. The 30-day asks you what shifted. Nothing is
          emailed. Nothing is tracked.
        </div>
        <div
          className="mt-4 rounded-md border border-dashed p-3 text-xs"
          style={{
            borderColor: "var(--warm-gray)",
            color: "var(--foreground)",
          }}
        >
          <div
            className="mb-1 font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            No calendar? No problem.
          </div>
          Screenshot your commitment above and text it to yourself, or save it
          as a note on your phone. Set a reminder for a week from today.
        </div>
      </Card>
    </div>
  );
}

function PostScreen({
  state,
  update,
}: {
  state: ReturnType<typeof useModuleState>["state"];
  update: ReturnType<typeof useModuleState>["update"];
}) {
  const delta =
    state.confidencePre !== null && state.confidencePost !== null
      ? state.confidencePost - state.confidencePre
      : null;
  return (
    <div className="max-w-2xl">
      <H2>How confident are you now?</H2>
      <Lead>
        Same question you answered at the start. Honest is more useful than
        high.
      </Lead>
      <Card>
        <ConfidenceSlider
          value={state.confidencePost}
          onChange={(v) => update({ confidencePost: v })}
        />
        {state.confidencePre !== null && state.confidencePost !== null && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <StatMini label="Before" value={state.confidencePre} />
            <StatMini label="After" value={state.confidencePost} />
            <StatMini
              label="Change"
              value={(delta ?? 0) >= 0 ? `+${delta}` : `${delta}`}
              highlight
            />
          </div>
        )}
      </Card>
    </div>
  );
}
function StatMini({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-md border p-3"
      style={{
        borderColor: highlight ? "var(--sonic)" : "var(--warm-gray)",
        backgroundColor: highlight ? "var(--sonic-soft)" : "#fff",
      }}
    >
      <div
        className="text-xs uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </div>
      <div
        className="text-2xl font-bold"
        style={{ color: "var(--foundation)", fontFamily: "var(--font-serif)" }}
      >
        {value}
      </div>
    </div>
  );
}

function RecapScreen({
  state,
}: {
  state: ReturnType<typeof useModuleState>["state"];
}) {
  const target = state.targetStyle ? STYLES[state.targetStyle] : null;
  const [copied, setCopied] = useState(false);
  const plan = [
    `Person: ${state.hookWho || "—"}`,
    `Their style: ${target?.name ?? "—"}`,
    `Commitment: ${state.commitment || "—"}`,
    "",
    "The message I'll send:",
    state.capstoneDraft || "—",
  ].join("\n");

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
          style={{ backgroundColor: "var(--sonic)", color: "#fff" }}
        >
          ✓
        </div>
        <H2>You built something real</H2>
      </div>
      <Lead>
        Not a quiz score — a message flexed for a real person. Copy your plan
        below and take it with you.
      </Lead>

      <Card>
        <div className="grid gap-2 sm:grid-cols-2">
          <RecapRow label="Your default" value={state.selfStyle ? STYLES[state.selfStyle].name : "—"} />
          <RecapRow label="Person" value={state.hookWho || "—"} />
          <RecapRow label="Their style" value={target?.name ?? "—"} />
          <RecapRow
            label="Confidence"
            value={
              state.confidencePre !== null && state.confidencePost !== null
                ? `${state.confidencePre} → ${state.confidencePost}`
                : "—"
            }
          />
        </div>
        {state.capstoneDraft && (
          <div
            className="mt-4 rounded-md p-3 text-sm"
            style={{
              backgroundColor: "var(--off-white)",
              color: "var(--foreground)",
            }}
          >
            <div
              className="mb-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Your message
            </div>
            <div className="whitespace-pre-wrap">{state.capstoneDraft}</div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(plan);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: "var(--deep)", color: "#fff" }}
          >
            {copied ? "Copied!" : "Copy my plan"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-md border px-4 py-2 text-sm font-semibold"
            style={{
              borderColor: "var(--foundation)",
              color: "var(--foundation)",
            }}
          >
            Print cheat sheet
          </button>
        </div>
      </Card>

      {state.team.length > 0 && (
        <div className="mt-6">
          <H2>Your team map</H2>
          <div className="space-y-2">
            {state.team.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                style={{ borderColor: "var(--warm-gray)" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--foundation)" }}
                >
                  {m.name}
                </span>
                <StyleBadge style={m.style} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <H2>If you see this — try this</H2>
        <Lead>
          A pocket reference for the next time someone's style doesn't match
          yours. Print it or screenshot it.
        </Lead>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                style: "d",
                see: "They cut you off, ask \"what's the ask?\", or push for a decision now.",
                try: "Lead with the bottom line. Offer 2–3 options and your pick. Name the deadline. Skip the warm-up.",
              },
              {
                style: "i",
                see: "They open with a story, use lots of emotion words, or reply with an emoji.",
                try: "Greet them by name. Frame the ask as a shared win. Invite their take. End with encouragement, not just a task.",
              },
              {
                style: "s",
                see: "They go quiet, say \"whatever works,\" or agree quickly without follow-up questions.",
                try: "Acknowledge them first. Give the why. Signal support is available. Ask what would help — and mean it.",
              },
              {
                style: "c",
                see: "They ask for the numbers, question the assumptions, or want it in writing.",
                try: "Lead with context and criteria. Use precise words. Show your steps. Say how you'll both know it's done.",
              },
            ] as const
          ).map((row) => (
            <div
              key={row.style}
              className="rounded-xl border p-4"
              style={{
                borderColor: STYLES[row.style].colorVar,
                backgroundColor: STYLES[row.style].softVar,
              }}
            >
              <div className="mb-2">
                <StyleBadge style={row.style} size="sm" />
              </div>
              <div className="mb-2 text-sm">
                <span
                  className="mr-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  See
                </span>
                {row.see}
              </div>
              <div className="text-sm">
                <span
                  className="mr-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Try
                </span>
                {row.try}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </div>
      <div
        className="text-lg"
        style={{ color: "var(--foundation)", fontFamily: "var(--font-serif)" }}
      >
        {value}
      </div>
    </div>
  );
}