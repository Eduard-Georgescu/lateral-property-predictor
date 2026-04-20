import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProcessParams } from "@/lib/lateralApi";

interface ProcessEditorProps {
  process: ProcessParams;
  onChange: (next: ProcessParams) => void;
}

const Field = ({
  label,
  unit,
  hint,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  unit: string;
  hint: string;
  value: number;
  step?: number;
  min?: number;
  onChange: (v: number) => void;
}) => {
  const [text, setText] = useState<string>(String(value));

  // Sync from outside (e.g. preset loaded) without clobbering active typing.
  useEffect(() => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed) || parsed !== value) {
      setText(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{unit}</span>
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
          if (text === "" || Number.isNaN(parseFloat(text))) {
            setText(String(value));
          }
        }}
        className="h-9 font-mono text-sm"
      />
      <p className="text-xs leading-tight text-muted-foreground">{hint}</p>
    </div>
  );
};

export const ProcessEditor = ({ process, onChange }: ProcessEditorProps) => {
  const set = (patch: Partial<ProcessParams>) => onChange({ ...process, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold">Process parameters</h3>
        <p className="text-xs text-muted-foreground">
          Solution-treat → quench → age. Set aging fields to 0 to skip.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Solution temp"
          unit="°C"
          hint="Solutionizing / homogenization temperature"
          value={process.temp}
          step={5}
          onChange={(v) => set({ temp: v })}
        />
        <Field
          label="Hold time"
          unit="hours"
          hint="Time at solution temperature"
          value={process.time}
          step={0.25}
          onChange={(v) => set({ time: v })}
        />
        <Field
          label="Cooling rate"
          unit="°C/s"
          hint="Quench rate after solution treatment"
          value={process.cooling_rate}
          step={5}
          onChange={(v) => set({ cooling_rate: v })}
        />
        <Field
          label="Aging temp"
          unit="°C"
          hint="Precipitation aging temperature (0 = none)"
          value={process.aging_temp ?? 0}
          step={5}
          onChange={(v) => set({ aging_temp: v })}
        />
        <Field
          label="Aging time"
          unit="hours"
          hint="Time at aging temperature (0 = none)"
          value={process.aging_time ?? 0}
          step={0.25}
          onChange={(v) => set({ aging_time: v })}
        />
      </div>
    </div>
  );
};
