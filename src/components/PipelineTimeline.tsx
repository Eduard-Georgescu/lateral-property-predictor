import { motion } from "framer-motion";
import { Boxes, Gauge, Shield, TrendingUp, Layers, Microscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SimulationResults } from "@/lib/lateralApi";
import { stepKindMeta, type ProcessStep } from "@/lib/processSteps";

export interface PipelineStageResult {
  step: ProcessStep;
  results: SimulationResults;
}

interface Props {
  stages: PipelineStageResult[];
}

interface TrackedProp {
  key: keyof SimulationResults;
  label: string;
  unit: string;
  icon: LucideIcon;
  format: (v: number) => string;
}

const TRACKED: TrackedProp[] = [
  { key: "density", label: "Density", unit: "g/cm³", icon: Boxes, format: (v) => v.toFixed(3) },
  { key: "hardness", label: "Hardness", unit: "HV", icon: Gauge, format: (v) => v.toFixed(0) },
  { key: "yield_strength", label: "Yield", unit: "MPa", icon: Shield, format: (v) => v.toFixed(0) },
  { key: "fracture_toughness", label: "Toughness", unit: "MPa·m½", icon: TrendingUp, format: (v) => v.toFixed(1) },
  { key: "grain_size", label: "Grain size", unit: "µm", icon: Microscope, format: (v) => v.toFixed(1) },
  { key: "volume", label: "Cell volume", unit: "Å³", icon: Layers, format: (v) => v.toFixed(2) },
];

const arrow = (delta: number) => {
  if (Math.abs(delta) < 1e-6) return { sym: "—", cls: "text-muted-foreground" };
  if (delta > 0) return { sym: "▲", cls: "text-success" };
  return { sym: "▼", cls: "text-warning" };
};

export const PipelineTimeline = ({ stages }: Props) => {
  if (stages.length === 0) return null;

  // Filter to props that have a numeric value somewhere
  const props = TRACKED.filter((p) =>
    stages.some((s) => typeof s.results[p.key] === "number" && !Number.isNaN(s.results[p.key] as number)),
  );

  return (
    <Card className="glass-card-elevated overflow-hidden p-0">
      <div className="border-b border-border bg-gradient-to-br from-accent/10 via-transparent to-transparent p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          Property evolution
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
          Across {stages.length} step{stages.length === 1 ? "" : "s"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Each column is the material state after that processing step.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-surface-elevated/40">
              <th className="sticky left-0 z-10 bg-surface-elevated/80 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                Property
              </th>
              {stages.map((s, i) => {
                const meta = stepKindMeta(s.step.kind);
                return (
                  <th
                    key={s.step.id}
                    className="border-l border-border/60 px-3 py-3 text-left align-bottom"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                        {meta.short}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {s.step.params.temp}°C · {s.step.params.time}h
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {props.map((p, rowIdx) => {
              const Icon = p.icon;
              return (
                <motion.tr
                  key={String(p.key)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.04 * rowIdx }}
                  className="group"
                >
                  <td className="sticky left-0 z-10 border-t border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span className="text-sm font-medium">{p.label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.unit}
                      </span>
                    </div>
                  </td>
                  {stages.map((s, colIdx) => {
                    const v = s.results[p.key];
                    if (typeof v !== "number" || Number.isNaN(v)) {
                      return (
                        <td
                          key={s.step.id}
                          className="border-l border-t border-border/60 px-3 py-3 font-mono text-xs text-muted-foreground"
                        >
                          —
                        </td>
                      );
                    }
                    const prev = colIdx > 0 ? (stages[colIdx - 1].results[p.key] as number | undefined) : undefined;
                    const delta = typeof prev === "number" ? v - prev : 0;
                    const a = arrow(delta);
                    return (
                      <td
                        key={s.step.id}
                        className="border-l border-t border-border/60 px-3 py-3"
                      >
                        <div className="font-display text-sm font-semibold tabular-nums text-foreground">
                          {p.format(v)}
                        </div>
                        {colIdx > 0 && (
                          <div className={cn("mt-0.5 font-mono text-[10px] tabular-nums", a.cls)}>
                            {a.sym} {Math.abs(delta) < 0.01 ? "0" : p.format(Math.abs(delta))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
