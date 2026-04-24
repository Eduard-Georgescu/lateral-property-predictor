import { motion } from "framer-motion";
import { Activity, Atom, Beaker, Boxes, Flame, Gauge, Layers, Microscope, Ruler, Shield, Snowflake, Thermometer, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SimulationResults } from "@/lib/lateralApi";

interface MetricDef {
  key: keyof SimulationResults | string;
  label: string;
  unit: string;
  icon: LucideIcon;
  format?: (v: number) => string;
  group: "mechanical" | "structural" | "thermal" | "microstructure";
  hint?: string;
}

const METRICS: MetricDef[] = [
  { key: "yield_strength", label: "Yield strength", unit: "MPa", icon: Shield, group: "mechanical", format: (v) => v.toFixed(0) },
  { key: "hardness", label: "Hardness", unit: "HV", icon: Gauge, group: "mechanical", format: (v) => v.toFixed(0) },
  { key: "hardness_hv", label: "Hardness (HV)", unit: "HV", icon: Gauge, group: "mechanical", format: (v) => v.toFixed(0) },
  { key: "fracture_toughness", label: "Fracture toughness", unit: "MPa·m½", icon: TrendingUp, group: "mechanical", format: (v) => v.toFixed(1) },
  { key: "elongation_pct", label: "Elongation", unit: "%", icon: Ruler, group: "mechanical", format: (v) => v.toFixed(1) },

  { key: "density", label: "Density", unit: "g/cm³", icon: Boxes, group: "structural", format: (v) => v.toFixed(3) },
  { key: "lattice_a", label: "Lattice a", unit: "Å", icon: Atom, group: "structural", format: (v) => v.toFixed(4) },
  { key: "lattice_c", label: "Lattice c", unit: "Å", icon: Atom, group: "structural", format: (v) => v.toFixed(4) },
  { key: "volume", label: "Cell volume", unit: "Å³", icon: Boxes, group: "structural", format: (v) => v.toFixed(2) },
  { key: "relative_density", label: "Relative density", unit: "—", icon: Layers, group: "structural", format: (v) => (v * (v < 1.5 ? 100 : 1)).toFixed(2) + "%" },
  { key: "porosity", label: "Porosity", unit: "%", icon: Layers, group: "structural", format: (v) => (v * 100).toFixed(2) },

  { key: "melting_point_C", label: "Melting point", unit: "°C", icon: Flame, group: "thermal", format: (v) => v.toFixed(0) },
  { key: "max_service_temp_C", label: "Max service T", unit: "°C", icon: Thermometer, group: "thermal", format: (v) => v.toFixed(0) },
  { key: "T_solvus_C", label: "Solvus T", unit: "°C", icon: Snowflake, group: "thermal", format: (v) => v.toFixed(0) },
  { key: "beta_transus_C", label: "β-transus", unit: "°C", icon: Snowflake, group: "thermal", format: (v) => v.toFixed(0) },

  { key: "grain_size", label: "Grain size", unit: "µm", icon: Microscope, group: "microstructure", format: (v) => v.toFixed(1) },
  { key: "gamma_prime_fraction", label: "γ′ fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
  { key: "gamma_prime_size_nm", label: "γ′ size", unit: "nm", icon: Microscope, group: "microstructure", format: (v) => v.toFixed(0) },
  { key: "precipitate_fraction", label: "Precipitate fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(2) },
  { key: "precipitate_size", label: "Precipitate size", unit: "nm", icon: Microscope, group: "microstructure", format: (v) => v.toFixed(1) },
  { key: "f_alpha", label: "α fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
  { key: "f_beta", label: "β fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
  { key: "f_martensite", label: "Martensite", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
  { key: "tic_fraction", label: "TiC fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
  { key: "wc_fraction", label: "WC fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
  { key: "binder_fraction", label: "Binder fraction", unit: "%", icon: Beaker, group: "microstructure", format: (v) => (v * 100).toFixed(1) },
];

const GROUP_LABEL: Record<MetricDef["group"] | "other", string> = {
  mechanical: "Mechanical",
  structural: "Structural",
  thermal: "Thermal",
  microstructure: "Microstructure",
  other: "Additional properties",
};

const MetricTile = ({ def, value, index }: { def: MetricDef; value: number; index: number }) => {
  const Icon = def.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.03 * index, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-lg border border-border bg-surface-elevated/70 p-4 transition-all hover:border-primary/40 hover:bg-surface-elevated"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {def.label}
        </span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {def.format ? def.format(value) : value.toFixed(2)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{def.unit}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
};

// Keys we never want to render as a metric tile (already shown in header or non-numeric meta)
const EXCLUDED_KEYS = new Set<string>([
  "category",
  "phase",
  "crystal_system",
  "prediction_mode",
  "classification_confidence",
  "ml_confidence",
]);

const humanizeKey = (k: string) =>
  k
    .replace(/_/g, " ")
    .replace(/\bpct\b/i, "%")
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());

export const ResultsPanel = ({
  results,
  displayName,
}: {
  results: SimulationResults;
  displayName?: string;
}) => {
  const grouped: Record<MetricDef["group"] | "other", { def: MetricDef; value: number }[]> = {
    mechanical: [], structural: [], thermal: [], microstructure: [], other: [],
  };
  const seen = new Set<string>();
  for (const def of METRICS) {
    const v = results[def.key as keyof SimulationResults];
    if (typeof v === "number" && !Number.isNaN(v)) {
      grouped[def.group].push({ def, value: v });
      seen.add(String(def.key));
    }
  }
  // Render every other numeric field the backend returned, so nothing is hidden.
  for (const [k, v] of Object.entries(results)) {
    if (seen.has(k) || EXCLUDED_KEYS.has(k)) continue;
    if (typeof v === "number" && !Number.isNaN(v)) {
      grouped.other.push({
        def: {
          key: k,
          label: humanizeKey(k),
          unit: "",
          icon: Activity,
          group: "microstructure",
          format: (n) => (Math.abs(n) >= 1000 || Number.isInteger(n) ? n.toFixed(0) : n.toFixed(3)),
        },
        value: v,
      });
    }
  }

  const classConf = (results.classification_confidence * 100).toFixed(0);
  const mlConf = (results.ml_confidence * 100).toFixed(0);
  const mlActive = results.ml_confidence > 0;
  const headerName = displayName ?? results.category;

  let i = 0;
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card-elevated overflow-hidden border-0 p-0">
        <div className="relative border-b border-border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-glow">
                Identified material
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                {headerName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {displayName && displayName !== results.category && (
                  <>Classifier: <span className="font-mono text-foreground">{results.category}</span>{"  ·  "}</>
                )}
                Phase: <span className="font-mono text-foreground">{results.phase}</span>
                {"  ·  "}Crystal: <span className="font-mono text-foreground">{results.crystal_system}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Classifier
                </div>
                <div className="font-display text-2xl font-semibold tabular-nums text-foreground">
                  {classConf}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  ML conf.
                </div>
                <div
                  className={cn(
                    "font-display text-2xl font-semibold tabular-nums",
                    mlActive ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  {mlActive ? `${mlConf}%` : "—"}
                </div>
              </div>
            </div>
          </div>
          <div className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/80 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-muted-foreground">{results.prediction_mode}</span>
          </div>
        </div>

        {/* Metric groups */}
        <div className="space-y-6 p-6">
          {(Object.keys(grouped) as (MetricDef["group"] | "other")[]).map((g) =>
            grouped[g].length === 0 ? null : (
              <section key={g}>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {GROUP_LABEL[g]}
                </h3>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {grouped[g].map(({ def, value }) => (
                    <MetricTile key={String(def.key)} def={def} value={value} index={i++} />
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      </Card>
    </div>
  );
};
