import { motion } from "framer-motion";
import { Loader2, Atom } from "lucide-react";

const STAGES = [
  "Classifying composition…",
  "Loading lattice priors…",
  "Running ML inference…",
  "Validating with physics engine…",
  "Blending predictions…",
];

export const SimulationLoader = () => (
  <div className="glass-card-elevated flex flex-col items-center justify-center gap-6 p-12">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-primary/40"
        style={{ borderStyle: "dashed" }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border border-accent/30"
        style={{ borderStyle: "dashed" }}
      />
      <div className="flex h-24 w-24 items-center justify-center">
        <Atom className="h-10 w-10 text-primary-glow" />
      </div>
    </div>
    <div className="space-y-2 text-center">
      <p className="font-display text-base font-medium text-foreground">Running LatERAL v4.1</p>
      <div className="space-y-1">
        {STAGES.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="font-mono">{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
