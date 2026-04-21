import type { ProcessParams } from "@/lib/lateralApi";

/**
 * High-level process step types. Each step is converted into a single
 * `ProcessParams` payload sent to /simulate. Because the backend exposes
 * one solution+age per call, multi-step pipelines are run sequentially:
 * the same composition is fed through each step and the per-step results
 * are stored so the UI can show how density / hardness / etc. evolve.
 */
export type StepKind =
  | "solution"
  | "age"
  | "anneal"
  | "quench"
  | "homogenize"
  | "stress_relief"
  | "custom";

export interface ProcessStep {
  id: string;
  kind: StepKind;
  label: string;
  params: ProcessParams;
}

export interface StepKindMeta {
  kind: StepKind;
  label: string;
  short: string;
  hint: string;
  defaults: ProcessParams;
}

// Sensible defaults inspired by typical alloy processing windows.
export const STEP_KINDS: StepKindMeta[] = [
  {
    kind: "solution",
    label: "Solution treatment",
    short: "Solution",
    hint: "Dissolve precipitates into a homogeneous solid solution.",
    defaults: { temp: 980, time: 1.0, cooling_rate: 50, aging_temp: 0, aging_time: 0 },
  },
  {
    kind: "age",
    label: "Precipitation aging",
    short: "Age",
    hint: "Hold below solvus to nucleate strengthening precipitates.",
    defaults: { temp: 760, time: 8, cooling_rate: 1, aging_temp: 760, aging_time: 8 },
  },
  {
    kind: "anneal",
    label: "Anneal",
    short: "Anneal",
    hint: "Recrystallize and soften — relieve cold work.",
    defaults: { temp: 850, time: 2, cooling_rate: 2, aging_temp: 0, aging_time: 0 },
  },
  {
    kind: "quench",
    label: "Quench",
    short: "Quench",
    hint: "Rapid cool — freeze in the high-T microstructure.",
    defaults: { temp: 900, time: 0.25, cooling_rate: 200, aging_temp: 0, aging_time: 0 },
  },
  {
    kind: "homogenize",
    label: "Homogenization",
    short: "Homogenize",
    hint: "Long, high-T hold to remove segregation from casting.",
    defaults: { temp: 1180, time: 12, cooling_rate: 5, aging_temp: 0, aging_time: 0 },
  },
  {
    kind: "stress_relief",
    label: "Stress relief",
    short: "Stress relief",
    hint: "Sub-critical hold to relax residual stress.",
    defaults: { temp: 600, time: 2, cooling_rate: 1, aging_temp: 0, aging_time: 0 },
  },
  {
    kind: "custom",
    label: "Custom step",
    short: "Custom",
    hint: "Free-form heat treatment with your own parameters.",
    defaults: { temp: 800, time: 1, cooling_rate: 10, aging_temp: 0, aging_time: 0 },
  },
];

export const stepKindMeta = (k: StepKind) =>
  STEP_KINDS.find((s) => s.kind === k) ?? STEP_KINDS[STEP_KINDS.length - 1];

let _counter = 0;
export const newStepId = () => `step_${Date.now().toString(36)}_${(_counter++).toString(36)}`;

export const buildStep = (kind: StepKind, overrides?: Partial<ProcessParams>): ProcessStep => {
  const meta = stepKindMeta(kind);
  return {
    id: newStepId(),
    kind,
    label: meta.label,
    params: { ...meta.defaults, ...overrides },
  };
};

/**
 * Convert a legacy single ProcessParams (from a preset) into a 1-step pipeline.
 * If aging is set we split it into an explicit Solution + Age, mirroring the
 * conceptual two-stage treatment shown in the Python script.
 */
export const pipelineFromProcess = (p: ProcessParams): ProcessStep[] => {
  const sol = buildStep("solution", {
    temp: p.temp,
    time: p.time,
    cooling_rate: p.cooling_rate,
    aging_temp: 0,
    aging_time: 0,
  });
  const hasAging = (p.aging_temp ?? 0) > 0 && (p.aging_time ?? 0) > 0;
  if (!hasAging) return [sol];
  const age = buildStep("age", {
    temp: p.aging_temp ?? 0,
    time: p.aging_time ?? 0,
    cooling_rate: 1,
    aging_temp: p.aging_temp ?? 0,
    aging_time: p.aging_time ?? 0,
  });
  return [sol, age];
};
