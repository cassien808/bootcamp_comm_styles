import { useCallback, useEffect, useMemo, useState } from "react";
import type { StyleKey } from "@/lib/disc";
import type { ScenarioTurn } from "@/lib/scenario";

const STORAGE_KEY = "csm.v1";

export interface TeamMember {
  id: string;
  name: string;
  style: StyleKey;
}

export interface RewriterEntry {
  score: number;
  hits: string[];
  misses: string[];
  feedback: string;
  suggestion: string;
  draft: string;
}

export interface ModuleState {
  cur: number;
  hookWho: string;
  hookWhat: string;
  confidencePre: number | null;
  confidencePost: number | null;
  selfStyle: StyleKey | null;
  selfReflection: string;
  sortAnswers: Record<string, StyleKey>;
  matchAnswers: Record<StyleKey, StyleKey | null>;
  emailAnswers: Record<number, StyleKey | null>;
  rewriter: Partial<Record<StyleKey, RewriterEntry>>;
  scenarioChoices: number[]; // legacy — retained for older saved sessions
  scenarioPath: ScenarioTurn[];
  team: TeamMember[];
  targetStyle: StyleKey | null;
  capstoneDraft: string;
  capstoneCoach: RewriterEntry | null;
  commitment: string;
  reminderDownloaded: boolean;
}

const initial: ModuleState = {
  cur: 0,
  hookWho: "",
  hookWhat: "",
  confidencePre: null,
  confidencePost: null,
  selfStyle: null,
  selfReflection: "",
  sortAnswers: {},
  matchAnswers: { d: null, i: null, s: null, c: null },
  emailAnswers: {},
  rewriter: {},
  scenarioChoices: [],
  scenarioPath: [],
  team: [],
  targetStyle: null,
  capstoneDraft: "",
  capstoneCoach: null,
  commitment: "",
  reminderDownloaded: false,
};

function loadState(): ModuleState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<ModuleState>;
    return { ...initial, ...parsed };
  } catch {
    return initial;
  }
}

export function useModuleState() {
  const [state, setState] = useState<ModuleState>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<ModuleState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...initial });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const goTo = useCallback((cur: number) => {
    setState((prev) => ({ ...prev, cur }));
  }, []);

  return useMemo(
    () => ({ state, update, reset, goTo, hydrated }),
    [state, update, reset, goTo, hydrated],
  );
}