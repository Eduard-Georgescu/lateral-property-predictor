import type { ProcessParams } from "@/lib/lateralApi";

/**
 * High-level process step types — aligned 1:1 with the LatERAL backend's
 * official 8 process categories (+ a free-form Custom). Each category may
 * expose sub-variants with calibrated defaults pulled from LatERAL's
 * `process_workflow.py` (e.g. quench media, AM SLM/EBM, casting types).
 *
 * Each step is converted into a single `ProcessParams` payload sent to
 * /simulate. Multi-step pipelines run sequentially so the UI can show
 * how density / hardness / etc. evolve after each step.
 */
export type StepKind =
  | "solution"
  | "quench"
  | "age"
  | "sps"
  | "hip"
  | "am"
  | "stress_relief"
  | "casting"
  | "custom";

export type StepCategory = "forming" | "consolidation" | "heat" | "custom";

/** UI-only extras carried alongside the backend ProcessParams payload. */
export interface StepExtras {
  // Consolidation (SPS / HIP)
  pressure?: number;       // MPa
  heating_rate?: number;   // °C/min  (SPS)
  green_density?: number;  // %       (SPS)
  // AM
  am_type?: "SLM" | "EBM";
  power?: number;          // W
  scan_speed?: number;     // mm/s
  layer_thickness?: number;// µm
  hatch_spacing?: number;  // µm
  energy_density?: number; // J/mm³ (derived)
  // Wrought
  reduction?: number;      // %
}

export interface StepVariant {
  id: string;
  label: string;
  hint?: string;
  defaults: Partial<ProcessParams>;
  extras?: StepExtras;
}

export interface ProcessStep {
  id: string;
  kind: StepKind;
  label: string;
  params: ProcessParams;
  variantId?: string;
  extras?: StepExtras;
}

export interface StepKindMeta {
  kind: StepKind;
  label: string;
  short: string;
  hint: string;
  category: StepCategory;
  defaults: ProcessParams;
  defaultExtras?: StepExtras;
  variants?: StepVariant[];
}

/* ----------------------------------------------------------------------- */
/*  LatERAL official process catalogue                                     */
/* ----------------------------------------------------------------------- */

export const STEP_KINDS: StepKindMeta[] = [
  // --- Forming ---------------------------------------------------------
  {
    kind: "am",
    label: "AM — Additive Manufacturing",
    short: "AM",
    hint: "Layer-wise build (SLM / EBM). Rapid local melt + cool.",
    category: "forming",
    defaults: { temp: 1400, time: 0.01, cooling_rate: 1000, aging_temp: 0, aging_time: 0 },
    defaultExtras: {
      am_type: "SLM",
      power: 200,
      scan_speed: 1000,
      layer_thickness: 30,
      hatch_spacing: 100,
      energy_density: 66.7,
    },
    variants: [
      {
        id: "slm",
        label: "SLM — Selective Laser Melting",
        hint: "Laser melt of powder bed. Typical for Ni / Ti / steel.",
        defaults: { temp: 1400, time: 0.01, cooling_rate: 1000 },
        extras: { am_type: "SLM", power: 200, scan_speed: 1000, layer_thickness: 30, hatch_spacing: 100 },
      },
      {
        id: "ebm",
        label: "EBM — Electron Beam Melting",
        hint: "Vacuum e-beam melt. Higher T, lower residual stress.",
        defaults: { temp: 1350, time: 0.02, cooling_rate: 500 },
        extras: { am_type: "EBM", power: 3000, scan_speed: 4000, layer_thickness: 70, hatch_spacing: 200 },
      },
    ],
  },
  {
    kind: "casting",
    label: "Casting / Forging / Wrought",
    short: "Cast",
    hint: "Primary forming — pour, forge, or roll into shape.",
    category: "forming",
    defaults: { temp: 1400, time: 0.5, cooling_rate: 1, aging_temp: 0, aging_time: 0 },
    variants: [
      {
        id: "sand",
        label: "Sand casting",
        hint: "Slow cooling in sand mold — coarse grain.",
        defaults: { temp: 1400, time: 0.5, cooling_rate: 1 },
      },
      {
        id: "investment",
        label: "Investment casting",
        hint: "Lost-wax with ceramic mold — fine surface, moderate cool.",
        defaults: { temp: 1300, time: 0.5, cooling_rate: 10 },
      },
      {
        id: "die",
        label: "Die casting",
        hint: "Metal mold — fast cool, fine grain.",
        defaults: { temp: 1100, time: 0.1, cooling_rate: 100 },
      },
      {
        id: "forging",
        label: "Forging",
        hint: "High-T plastic deformation — refined wrought structure.",
        defaults: { temp: 1050, time: 0.25, cooling_rate: 10 },
      },
      {
        id: "wrought",
        label: "Wrought / rolled / extruded",
        hint: "Worked above recrystallization with reduction.",
        defaults: { temp: 950, time: 0.3, cooling_rate: 20 },
        extras: { reduction: 50 },
      },
      {
        id: "custom",
        label: "Custom conventional",
        hint: "Free-form primary forming.",
        defaults: { temp: 1200, time: 0.5, cooling_rate: 5 },
      },
    ],
  },

  // --- Consolidation ---------------------------------------------------
  {
    kind: "sps",
    label: "SPS — Spark Plasma Sintering",
    short: "SPS",
    hint: "Pulsed-current densification under pressure. Fast, fine grain.",
    category: "consolidation",
    defaults: { temp: 1200, time: 10 / 60, cooling_rate: 100, aging_temp: 0, aging_time: 0 },
    defaultExtras: { pressure: 50, heating_rate: 100, green_density: 65 },
  },
  {
    kind: "hip",
    label: "HIP — Hot Isostatic Pressing",
    short: "HIP",
    hint: "High-T high-P consolidation. Closes porosity.",
    category: "consolidation",
    defaults: { temp: 1200, time: 4, cooling_rate: 3, aging_temp: 0, aging_time: 0 },
    defaultExtras: { pressure: 150 },
  },

  // --- Heat treatment --------------------------------------------------
  {
    kind: "solution",
    label: "Solution heat treatment",
    short: "Solution",
    hint: "Dissolve precipitates into a homogeneous solid solution.",
    category: "heat",
    defaults: { temp: 1080, time: 1.0, cooling_rate: 50, aging_temp: 0, aging_time: 0 },
  },
  {
    kind: "quench",
    label: "Quench",
    short: "Quench",
    hint: "Rapid cool — freeze the high-T microstructure.",
    category: "heat",
    defaults: { temp: 900, time: 0.05, cooling_rate: 200, aging_temp: 0, aging_time: 0 },
    variants: [
      { id: "water",   label: "Water quench",  hint: "~1000 °C/s — most severe.",       defaults: { cooling_rate: 1000 } },
      { id: "oil",     label: "Oil quench",    hint: "~200 °C/s — common for steels.",  defaults: { cooling_rate: 200 } },
      { id: "air",     label: "Air cool",      hint: "~10 °C/s — moderate.",            defaults: { cooling_rate: 10 } },
      { id: "furnace", label: "Furnace cool",  hint: "~1 °C/s — slowest, soft result.", defaults: { cooling_rate: 1 } },
      { id: "custom",  label: "Custom rate",   hint: "Set your own cooling rate.",      defaults: {} },
    ],
  },
  {
    kind: "age",
    label: "Aging / Precipitation",
    short: "Age",
    hint: "Hold below solvus to nucleate strengthening precipitates.",
    category: "heat",
    defaults: { temp: 760, time: 8, cooling_rate: 1, aging_temp: 760, aging_time: 8 },
  },
  {
    kind: "stress_relief",
    label: "Stress Relief / Annealing",
    short: "Stress relief",
    hint: "Sub-critical hold to relax residual stress and soften.",
    category: "heat",
    defaults: { temp: 650, time: 2, cooling_rate: 2, aging_temp: 0, aging_time: 0 },
  },

  // --- Custom ----------------------------------------------------------
  {
    kind: "custom",
    label: "Custom step",
    short: "Custom",
    hint: "Free-form heat treatment with your own parameters.",
    category: "custom",
    defaults: { temp: 800, time: 1, cooling_rate: 10, aging_temp: 0, aging_time: 0 },
  },
];

export const CATEGORY_LABEL: Record<StepCategory, string> = {
  forming: "Forming",
  consolidation: "Consolidation",
  heat: "Heat treatment",
  custom: "Custom",
};

export const CATEGORY_ORDER: StepCategory[] = ["forming", "consolidation", "heat", "custom"];

export const stepKindMeta = (k: StepKind) =>
  STEP_KINDS.find((s) => s.kind === k) ?? STEP_KINDS[STEP_KINDS.length - 1];

export const stepVariantMeta = (k: StepKind, variantId?: string): StepVariant | undefined => {
  const meta = stepKindMeta(k);
  if (!meta.variants || !variantId) return undefined;
  return meta.variants.find((v) => v.id === variantId);
};

/** Group STEP_KINDS by category, preserving STEP_KINDS order within each group. */
export const groupedStepKinds = (): { category: StepCategory; items: StepKindMeta[] }[] =>
  CATEGORY_ORDER.map((category) => ({
    category,
    items: STEP_KINDS.filter((s) => s.category === category),
  })).filter((g) => g.items.length > 0);

let _counter = 0;
export const newStepId = () => `step_${Date.now().toString(36)}_${(_counter++).toString(36)}`;

/** Compute AM volumetric energy density (J/mm³) from power (W), scan speed (mm/s),
 *  hatch (µm) and layer thickness (µm). E = P / (v · h · t) with h,t in mm. */
export const computeEnergyDensity = (extras: StepExtras): number | undefined => {
  const { power, scan_speed, hatch_spacing, layer_thickness } = extras;
  if (!power || !scan_speed || !hatch_spacing || !layer_thickness) return undefined;
  const h = hatch_spacing / 1000;
  const t = layer_thickness / 1000;
  const denom = scan_speed * h * t;
  if (denom <= 0) return undefined;
  return power / denom;
};

export const buildStep = (
  kind: StepKind,
  overrides?: Partial<ProcessParams>,
  variantId?: string,
): ProcessStep => {
  const meta = stepKindMeta(kind);
  const variant =
    (variantId && meta.variants?.find((v) => v.id === variantId)) ||
    meta.variants?.[0];
  const params: ProcessParams = {
    ...meta.defaults,
    ...(variant?.defaults ?? {}),
    ...overrides,
  };
  let extras: StepExtras | undefined =
    meta.defaultExtras || variant?.extras
      ? { ...(meta.defaultExtras ?? {}), ...(variant?.extras ?? {}) }
      : undefined;
  if (kind === "am" && extras) {
    const e = computeEnergyDensity(extras);
    if (e !== undefined) extras = { ...extras, energy_density: Math.round(e * 10) / 10 };
  }
  return {
    id: newStepId(),
    kind,
    label: meta.label,
    params,
    variantId: variant?.id,
    extras,
  };
};

/**
 * Convert a legacy single ProcessParams (from a preset) into a 1-step pipeline.
 * Splits into Solution + Age if aging is configured.
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
