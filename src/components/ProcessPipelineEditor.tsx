import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  buildStep,
  CATEGORY_LABEL,
  computeEnergyDensity,
  groupedStepKinds,
  stepKindMeta,
  stepVariantMeta,
  type ProcessStep,
  type StepExtras,
  type StepKind,
} from "@/lib/processSteps";
import type { ProcessParams } from "@/lib/lateralApi";

interface Props {
  steps: ProcessStep[];
  onChange: (next: ProcessStep[]) => void;
}

/* ---------- numeric field with local-text editing (allows full erase) ---------- */
const NumField = ({
  label,
  unit,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) => {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed) || parsed !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
          {unit}
        </span>
      </div>
      <Input
        type="number"
        step="any"
        min={min}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          if (raw === "" || raw === "-" || raw === ".") return;
          const parsed = parseFloat(raw);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        onBlur={() => {
          if (text === "" || Number.isNaN(parseFloat(text))) setText(String(value));
        }}
        className="h-8 font-mono text-xs"
      />
    </div>
  );
};

/* ---------- grouped step-kind dropdown (used for both Add and Change) ---------- */
const GroupedKindMenu = ({
  trigger,
  onPick,
  align = "start",
}: {
  trigger: React.ReactNode;
  onPick: (k: StepKind) => void;
  align?: "start" | "end";
}) => {
  const groups = useMemo(() => groupedStepKinds(), []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-72 max-h-[60vh] overflow-y-auto">
        {groups.map((g, gi) => (
          <div key={g.category}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[g.category]}
            </DropdownMenuLabel>
            {g.items.map((k) => (
              <DropdownMenuItem key={k.kind} onClick={() => onPick(k.kind)} className="py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{k.label}</span>
                  <span className="text-[11px] text-muted-foreground">{k.hint}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ---------- variant picker for a step that supports variants ---------- */
const VariantPicker = ({
  step,
  onPick,
}: {
  step: ProcessStep;
  onPick: (variantId: string) => void;
}) => {
  const meta = stepKindMeta(step.kind);
  if (!meta.variants?.length) return null;
  const current = stepVariantMeta(step.kind, step.variantId) ?? meta.variants[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-2 py-1 text-[11px] font-medium hover:border-primary/40 hover:bg-surface-elevated"
        >
          <span className="text-muted-foreground">Variant:</span>
          <span className="text-foreground">{current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {meta.variants.map((v) => (
          <DropdownMenuItem key={v.id} onClick={() => onPick(v.id)} className="py-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{v.label}</span>
              {v.hint && <span className="text-[11px] text-muted-foreground">{v.hint}</span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ---------- AM-specific extras with live energy-density readout ---------- */
const AmExtras = ({
  extras,
  onPatch,
}: {
  extras: StepExtras;
  onPatch: (patch: Partial<StepExtras>) => void;
}) => {
  const ed = computeEnergyDensity(extras);
  return (
    <div className="mt-3 rounded-md border border-border/50 bg-background/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          AM parameters
        </span>
        <span className="font-mono text-[10px] text-accent">
          E = {ed !== undefined ? `${ed.toFixed(1)} J/mm³` : "—"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumField label="Power" unit="W" value={extras.power ?? 0} onChange={(v) => onPatch({ power: v })} />
        <NumField label="Scan speed" unit="mm/s" value={extras.scan_speed ?? 0} onChange={(v) => onPatch({ scan_speed: v })} />
        <NumField label="Layer" unit="µm" value={extras.layer_thickness ?? 0} onChange={(v) => onPatch({ layer_thickness: v })} />
        <NumField label="Hatch" unit="µm" value={extras.hatch_spacing ?? 0} onChange={(v) => onPatch({ hatch_spacing: v })} />
      </div>
    </div>
  );
};

/* ---------- single step card ---------- */
const StepCard = ({
  step,
  index,
  total,
  onPatch,
  onPatchExtras,
  onRemove,
  onMove,
  onChangeKind,
  onChangeVariant,
}: {
  step: ProcessStep;
  index: number;
  total: number;
  onPatch: (patch: Partial<ProcessParams>) => void;
  onPatchExtras: (patch: Partial<StepExtras>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onChangeKind: (k: StepKind) => void;
  onChangeVariant: (variantId: string) => void;
}) => {
  const meta = stepKindMeta(step.kind);
  const extras = step.extras ?? {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-lg border border-border bg-surface-elevated/60 p-4 transition-colors hover:border-primary/30"
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-[11px] font-semibold text-primary">
            {index + 1}
          </div>
          <button
            type="button"
            aria-label="Drag to reorder"
            className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <GroupedKindMenu
              onPick={onChangeKind}
              trigger={
                <button className="flex items-center gap-2 rounded-md px-2 py-1 -mx-2 -my-1 text-left transition-colors hover:bg-surface-elevated">
                  <span className="font-display text-sm font-semibold">{meta.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    change
                  </span>
                </button>
              }
            />
            <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[meta.category]}
            </span>
            {meta.variants && <VariantPicker step={step} onPick={onChangeVariant} />}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{meta.hint}</p>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="Move up"
          >
            <ArrowDown className="h-3.5 w-3.5 rotate-180" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove step"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Core thermal params */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <NumField label="Temp" unit="°C" value={step.params.temp} onChange={(v) => onPatch({ temp: v })} />
        <NumField label="Hold" unit="hours" value={step.params.time} onChange={(v) => onPatch({ time: v })} />
        <NumField
          label="Cool rate"
          unit="°C/s"
          value={step.params.cooling_rate}
          onChange={(v) => onPatch({ cooling_rate: v })}
        />
        {(step.kind === "age" || step.kind === "custom") && (
          <>
            <NumField
              label="Aging temp"
              unit="°C"
              value={step.params.aging_temp ?? 0}
              onChange={(v) => onPatch({ aging_temp: v })}
            />
            <NumField
              label="Aging time"
              unit="hours"
              value={step.params.aging_time ?? 0}
              onChange={(v) => onPatch({ aging_time: v })}
            />
          </>
        )}
      </div>

      {/* Process-specific extras */}
      {step.kind === "am" && <AmExtras extras={extras} onPatch={onPatchExtras} />}

      {step.kind === "sps" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <NumField label="Pressure" unit="MPa" value={extras.pressure ?? 0} onChange={(v) => onPatchExtras({ pressure: v })} />
          <NumField label="Heating rate" unit="°C/min" value={extras.heating_rate ?? 0} onChange={(v) => onPatchExtras({ heating_rate: v })} />
          <NumField label="Green density" unit="%" value={extras.green_density ?? 0} onChange={(v) => onPatchExtras({ green_density: v })} />
        </div>
      )}

      {step.kind === "hip" && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <NumField label="Pressure" unit="MPa" value={extras.pressure ?? 0} onChange={(v) => onPatchExtras({ pressure: v })} />
        </div>
      )}

      {step.kind === "casting" && step.variantId === "wrought" && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <NumField label="Reduction" unit="%" value={extras.reduction ?? 0} onChange={(v) => onPatchExtras({ reduction: v })} />
        </div>
      )}
    </motion.div>
  );
};

/* ---------- pipeline editor ---------- */
export const ProcessPipelineEditor = ({ steps, onChange }: Props) => {
  const patch = (id: string, p: Partial<ProcessParams>) =>
    onChange(steps.map((s) => (s.id === id ? { ...s, params: { ...s.params, ...p } } : s)));

  const patchExtras = (id: string, p: Partial<StepExtras>) =>
    onChange(
      steps.map((s) => {
        if (s.id !== id) return s;
        const nextExtras = { ...(s.extras ?? {}), ...p } as StepExtras;
        if (s.kind === "am") {
          const ed = computeEnergyDensity(nextExtras);
          if (ed !== undefined) nextExtras.energy_density = Math.round(ed * 10) / 10;
        }
        return { ...s, extras: nextExtras };
      }),
    );

  const remove = (id: string) => onChange(steps.filter((s) => s.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    const i = steps.findIndex((s) => s.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const changeKind = (id: string, k: StepKind) =>
    onChange(
      steps.map((s) => {
        if (s.id !== id) return s;
        const fresh = buildStep(k);
        return { ...fresh, id: s.id };
      }),
    );

  const changeVariant = (id: string, variantId: string) =>
    onChange(
      steps.map((s) => {
        if (s.id !== id) return s;
        const variant = stepVariantMeta(s.kind, variantId);
        if (!variant) return s;
        return {
          ...s,
          variantId,
          params: { ...s.params, ...variant.defaults },
          extras: variant.extras
            ? { ...(s.extras ?? {}), ...variant.extras }
            : s.extras,
        };
      }),
    );

  const add = (k: StepKind) => onChange([...steps, buildStep(k)]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Process pipeline</h3>
          <p className="text-xs text-muted-foreground">
            Chain LatERAL processing steps. Each runs in sequence on the same composition,
            and you'll see how density & properties evolve.
          </p>
        </div>
        <GroupedKindMenu
          align="end"
          onPick={add}
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
              <Plus className="h-3.5 w-3.5" /> Add step
            </Button>
          }
        />
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {steps.map((s, i) => (
            <div key={s.id} className="relative">
              <StepCard
                step={s}
                index={i}
                total={steps.length}
                onPatch={(p) => patch(s.id, p)}
                onPatchExtras={(p) => patchExtras(s.id, p)}
                onRemove={() => remove(s.id)}
                onMove={(d) => move(s.id, d)}
                onChangeKind={(k) => changeKind(s.id, k)}
                onChangeVariant={(v) => changeVariant(s.id, v)}
              />
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className={cn(
                    "ml-3.5 flex h-3 items-center justify-start",
                    "before:block before:h-3 before:w-px before:bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </AnimatePresence>
        {steps.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No steps yet. Add a solution treatment to get started.
          </div>
        )}
      </div>
    </div>
  );
};
