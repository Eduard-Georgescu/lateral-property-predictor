import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Beaker, Cpu, Download, FileJson, FlaskConical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandMark } from "@/components/BrandMark";
import { BackendSettings } from "@/components/BackendSettings";
import { CompositionEditor } from "@/components/CompositionEditor";
import { ProcessEditor } from "@/components/ProcessEditor";
import { PresetGallery } from "@/components/PresetGallery";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SimulationLoader } from "@/components/SimulationLoader";

import { MATERIAL_PRESETS, type MaterialPreset } from "@/lib/materialPresets";
import {
  checkHealth,
  getApiBase,
  simulate,
  type ProcessParams,
  type SimulateResponse,
} from "@/lib/lateralApi";

const compositionsEqual = (a: Record<string, number>, b: Record<string, number>) => {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (Math.abs((a[k] ?? 0) - (b[k] ?? 0)) > 1e-6) return false;
  }
  return true;
};

const processesEqual = (a: ProcessParams, b: ProcessParams) =>
  a.temp === b.temp &&
  a.time === b.time &&
  a.cooling_rate === b.cooling_rate &&
  (a.aging_temp ?? 0) === (b.aging_temp ?? 0) &&
  (a.aging_time ?? 0) === (b.aging_time ?? 0);

const Workbench = () => {
  const initial = MATERIAL_PRESETS[0];
  const [presetId, setPresetId] = useState<string>(initial.id);
  const [composition, setComposition] = useState<Record<string, number>>(initial.composition);
  const [process, setProcess] = useState<ProcessParams>(initial.process);
  const [response, setResponse] = useState<SimulateResponse | null>(null);
  const [usedPresetName, setUsedPresetName] = useState<string | null>(initial.name);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  const probeBackend = async () => {
    if (!getApiBase()) {
      setBackendOk(false);
      return;
    }
    try {
      const h = await checkHealth();
      setBackendOk(h.status === "ok");
    } catch {
      setBackendOk(false);
    }
  };

  useEffect(() => {
    probeBackend();
  }, []);

  const mutation = useMutation({
    mutationFn: simulate,
    onSuccess: (data) => {
      setResponse(data);
      toast.success("Simulation complete", {
        description: `${usedPresetName ?? data.results.category} · ${(data.results.classification_confidence * 100).toFixed(0)}% confidence`,
      });
    },
    onError: (err: Error) => {
      toast.error("Simulation failed", { description: err.message });
    },
  });

  const onPreset = (p: MaterialPreset) => {
    setPresetId(p.id);
    setComposition(p.composition);
    setProcess(p.process);
    setResponse(null);
  };

  // Determine if the current state still matches a known preset (so we can override the name).
  const matchedPresetName = useMemo(() => {
    const p = MATERIAL_PRESETS.find((x) => x.id === presetId);
    if (!p) return null;
    if (compositionsEqual(p.composition, composition) && processesEqual(p.process, process)) {
      return p.name;
    }
    return null;
  }, [presetId, composition, process]);

  const onRun = () => {
    if (!getApiBase()) {
      toast.error("Backend not configured");
      return;
    }
    const total = Object.values(composition).reduce((s, v) => s + v, 0);
    if (total <= 0) {
      toast.error("Composition is empty");
      return;
    }
    setUsedPresetName(matchedPresetName);
    const normalized: Record<string, number> = {};
    for (const [el, frac] of Object.entries(composition)) normalized[el] = frac / total;
    mutation.mutate({ composition: normalized, process });
  };

  const exportJson = () => {
    if (!response) return;
    const payload = {
      input: { composition, process, preset: usedPresetName },
      output: response.results,
      log: response.log,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lateral-${(usedPresetName ?? response.results.category).replace(/\W+/g, "_")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusChip = useMemo(() => {
    if (backendOk === null) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/80 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
          Checking backend…
        </span>
      );
    }
    if (backendOk) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
          <span className="pulse-dot" /> Inference engine online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Backend offline
      </span>
    );
  }, [backendOk]);

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <BrandMark size={32} />
              <div className="leading-tight">
                <div className="font-display text-lg font-semibold tracking-tight">LatERAL</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Workbench
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {statusChip}
            <BackendSettings onConnected={probeBackend} />
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-8 lg:py-12">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Material workbench
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a preset, edit composition or process, and run a full simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <Card className="glass-card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
              <PresetGallery selectedId={presetId} onSelect={onPreset} />
            </Card>
          </aside>

          <div className="space-y-6 lg:col-span-8">
            <Card className="glass-card-elevated p-6">
              <Tabs defaultValue="composition" className="w-full">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <TabsList className="bg-surface-elevated">
                    <TabsTrigger value="composition" className="gap-2">
                      <Beaker className="h-3.5 w-3.5" /> Composition
                    </TabsTrigger>
                    <TabsTrigger value="process" className="gap-2">
                      <FlaskConical className="h-3.5 w-3.5" /> Process
                    </TabsTrigger>
                  </TabsList>

                  <Button
                    size="lg"
                    onClick={onRun}
                    disabled={mutation.isPending}
                    className="gap-2 bg-gradient-primary text-primary-foreground shadow-glow"
                  >
                    <Cpu className="h-4 w-4" />
                    {mutation.isPending ? "Simulating…" : "Run simulation"}
                  </Button>
                </div>

                <TabsContent value="composition" className="mt-0">
                  <CompositionEditor
                    composition={composition}
                    onChange={setComposition}
                    onReset={() => setComposition({})}
                  />
                </TabsContent>
                <TabsContent value="process" className="mt-0">
                  <ProcessEditor process={process} onChange={setProcess} />
                </TabsContent>
              </Tabs>
            </Card>

            {mutation.isPending ? (
              <SimulationLoader />
            ) : response ? (
              <div className="space-y-3">
                <ResultsPanel
                  results={response.results}
                  displayName={usedPresetName ?? undefined}
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={exportJson} className="gap-2">
                    <Download className="h-3.5 w-3.5" /> Export JSON
                  </Button>
                </div>

                {response.log && (
                  <details className="glass-card group p-4">
                    <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                      <FileJson className="h-3.5 w-3.5" />
                      Engine log
                      <span className="ml-auto text-xs text-muted-foreground">
                        click to expand
                      </span>
                    </summary>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                      {response.log}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <Card className="glass-card flex flex-col items-center justify-center gap-3 p-12 text-center">
                <BrandMark size={48} className="opacity-70" />
                <h3 className="font-display text-lg font-semibold">Ready when you are</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Pick a preset on the left, tweak the composition or process if you like, and hit{" "}
                  <span className="font-medium text-foreground">Run simulation</span>.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Workbench;
