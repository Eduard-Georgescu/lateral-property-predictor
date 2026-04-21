import { useEffect, useMemo, useState } from "react";
import { Plus, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KNOWN_ELEMENTS } from "@/lib/materialPresets";
import { cn } from "@/lib/utils";

/** Number input that allows the user to fully erase the value while typing. */
const PctInput = ({ value, onCommit }: { value: number; onCommit: (n: number) => void }) => {
  const [text, setText] = useState<string>(String(value));

  useEffect(() => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed) || parsed !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      type="number"
      step="any"
      min="0"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === "" || raw === "." || raw === "-") return;
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed)) onCommit(parsed);
      }}
      onBlur={() => {
        if (text === "" || Number.isNaN(parseFloat(text))) setText(String(value));
      }}
      className="h-8 border-0 bg-transparent font-mono text-sm focus-visible:ring-1"
    />
  );
};

interface CompositionEditorProps {
  composition: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  onReset?: () => void;
}

/**
 * Editable composition table — element + atomic/weight fraction.
 * Values are entered as percentages (0–100) for human friendliness, then
 * normalized to fractions when sent to the backend.
 */
export const CompositionEditor = ({
  composition,
  onChange,
  onReset,
}: CompositionEditorProps) => {
  const [newEl, setNewEl] = useState("");

  // Convert internal fractions -> displayed percentages
  const rows = useMemo(
    () =>
      Object.entries(composition).map(([el, frac]) => ({
        el,
        pct: frac * 100,
      })),
    [composition]
  );

  const total = rows.reduce((s, r) => s + r.pct, 0);
  const normalized = Math.abs(total - 100) < 0.05;

  const setPct = (el: string, pct: number) => {
    const next = { ...composition, [el]: Math.max(0, pct) / 100 };
    onChange(next);
  };

  const removeEl = (el: string) => {
    const next = { ...composition };
    delete next[el];
    onChange(next);
  };

  const addEl = () => {
    const sym = newEl.trim();
    if (!sym) return;
    // Normalize like "fe" -> "Fe", "FE" -> "Fe"
    const norm =
      sym.length === 1
        ? sym.toUpperCase()
        : sym.charAt(0).toUpperCase() + sym.slice(1).toLowerCase();
    if (composition[norm] !== undefined) return;
    onChange({ ...composition, [norm]: 0 });
    setNewEl("");
  };

  const normalize = () => {
    if (total <= 0) return;
    const factor = 1 / Object.values(composition).reduce((s, v) => s + v, 0);
    const next: Record<string, number> = {};
    for (const [el, frac] of Object.entries(composition)) next[el] = frac * factor;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Composition</h3>
          <p className="text-xs text-muted-foreground">
            Atomic fractions, normalized to 100%.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-xs",
              normalized
                ? "border-success/40 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning"
            )}
          >
            Σ {total.toFixed(2)}%
          </span>
          {!normalized && (
            <Button size="sm" variant="ghost" onClick={normalize} className="gap-1.5 text-xs">
              <RotateCcw className="h-3 w-3" /> Normalize
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map(({ el, pct }) => (
          <div
            key={el}
            className="group flex items-center gap-2 rounded-lg border border-border bg-surface-elevated/60 px-3 py-2 transition-colors hover:border-primary/40"
          >
            <div className="flex h-8 w-10 items-center justify-center rounded-md bg-primary/15 font-mono text-sm font-semibold text-primary-glow">
              {el}
            </div>
            <PctInput value={pct} onCommit={(n) => setPct(el, n)} />
            <span className="font-mono text-xs text-muted-foreground">%</span>
            <button
              type="button"
              onClick={() => removeEl(el)}
              className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label={`Remove ${el}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Input
          placeholder="Add element (e.g. Mo)"
          value={newEl}
          onChange={(e) => setNewEl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEl();
            }
          }}
          className="h-9 max-w-[180px] font-mono text-sm"
        />
        <Button size="sm" variant="secondary" onClick={addEl} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
        {onReset && (
          <Button size="sm" variant="ghost" onClick={onReset} className="ml-auto text-xs text-muted-foreground">
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
