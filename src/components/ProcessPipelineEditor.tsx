import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  buildStep,
  STEP_KINDS,
  stepKindMeta,
  type ProcessStep,
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

/* ---------- single step card ---------- */
const StepCard = ({
  step,
  index,
  total,
  onPatch,
  onRemove,
  onMove,
  onChangeKind,
}: {
  step: ProcessStep;
  index: number;
  total: number;
  onPatch: (patch: Partial<ProcessParams>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onChangeKind: (k: StepKind) => void;
}) => {
  const meta = stepKindMeta(step.kind);

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1 -mx-2 -my-1 text-left transition-colors hover:bg-surface-elevated">
                <span className="font-display text-sm font-semibold">{meta.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  change
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {STEP_KINDS.map((k) => (
                <DropdownMenuItem key={k.kind} onClick={() => onChangeKind(k.kind)}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{k.label}</span>
                    <span className="text-[11px] text-muted-foreground">{k.hint}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Params */}
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
    </motion.div>
  );
};

/* ---------- pipeline editor ---------- */
export const ProcessPipelineEditor = ({ steps, onChange }: Props) => {
  const patch = (id: string, p: Partial<ProcessParams>) =>
    onChange(steps.map((s) => (s.id === id ? { ...s, params: { ...s.params, ...p } } : s)));

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
      steps.map((s) =>
        s.id === id ? { ...s, kind: k, label: stepKindMeta(k).label, params: { ...stepKindMeta(k).defaults } } : s,
      ),
    );

  const add = (k: StepKind) => onChange([...steps, buildStep(k)]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Process pipeline</h3>
          <p className="text-xs text-muted-foreground">
            Chain heat-treatment steps. Each runs in sequence on the same composition,
            and you'll see how density & properties evolve.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
              <Plus className="h-3.5 w-3.5" /> Add step
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {STEP_KINDS.map((k) => (
              <DropdownMenuItem key={k.kind} onClick={() => add(k.kind)}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{k.label}</span>
                  <span className="text-[11px] text-muted-foreground">{k.hint}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
                onRemove={() => remove(s.id)}
                onMove={(d) => move(s.id, d)}
                onChangeKind={(k) => changeKind(s.id, k)}
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
