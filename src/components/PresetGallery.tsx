import { motion } from "framer-motion";
import { MATERIAL_PRESETS, type MaterialPreset } from "@/lib/materialPresets";
import { cn } from "@/lib/utils";

interface PresetGalleryProps {
  selectedId?: string;
  onSelect: (preset: MaterialPreset) => void;
}

const FAMILY_DOT: Record<MaterialPreset["family"], string> = {
  "Nickel Superalloy": "bg-primary",
  "Titanium Alloy": "bg-accent",
  "Steel": "bg-muted-foreground",
  "Aluminum Alloy": "bg-warning",
  "High-Entropy Alloy": "bg-primary-glow",
  "Refractory / UHTC": "bg-destructive",
  "Carbide Composite": "bg-success",
  "Shape Memory Alloy": "bg-accent",
  "Intermetallic": "bg-primary",
  "Bulk Metallic Glass": "bg-primary-glow",
};

export const PresetGallery = ({ selectedId, onSelect }: PresetGalleryProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Preset library</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {MATERIAL_PRESETS.length} alloys
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MATERIAL_PRESETS.map((p, idx) => {
          const active = p.id === selectedId;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.02 * idx }}
              className={cn(
                "group relative overflow-hidden rounded-lg border p-3 text-left transition-all",
                active
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-surface-elevated/60 hover:border-primary/50 hover:bg-surface-elevated"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-sm font-semibold text-foreground">
                    {p.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", FAMILY_DOT[p.family])} />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {p.family}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 -space-x-1">
                  {Object.keys(p.composition).slice(0, 4).map((el) => (
                    <span
                      key={el}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface font-mono text-[9px] font-semibold text-foreground"
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">
                {p.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
