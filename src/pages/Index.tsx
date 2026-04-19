import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Beaker, Cpu, Download, ExternalLink, FileJson, FlaskConical, Github, Sparkles } from "lucide-react";
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

const Index = () => {
  const initial = MATERIAL_PRESETS[0];
  const [presetId, setPresetId] = useState<string>(initial.id);
  const [composition, setComposition] = useState<Record<string, number>>(initial.composition);
  const [process, setProcess] = useState<ProcessParams>(initial.process);
  const [response, setResponse] = useState<SimulateResponse | null>(null);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  // Probe backend on load and whenever the URL changes via the dialog.
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
        description: `${data.results.category} · ${(data.results.classification_confidence * 100).toFixed(0)}% confidence`,
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

  const onRun = () => {
    if (!getApiBase()) {
      toast.error("Backend not configured", {
        description: "Open Backend settings (top right) and paste your Hugging Face Space URL.",
      });
      return;
    }
    // Normalize composition before sending
    const total = Object.values(composition).reduce((s, v) => s + v, 0);
    if (total <= 0) {
      toast.error("Composition is empty");
      return;
    }
    const normalized: Record<string, number> = {};
    for (const [el, frac] of Object.entries(composition)) normalized[el] = frac / total;
    mutation.mutate({ composition: normalized, process });
  };

  const exportJson = () => {
    if (!response) return;
    const payload = {
      input: { composition, process },
      output: response.results,
      log: response.log,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lateral-${response.results.category.replace(/\W+/g, "_")}-${Date.now()}.json`;
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
        <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Backend not connected
      </span>
    );
  }, [backendOk]);

  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={32} />
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold tracking-tight">LatERAL</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                v4.1 · Material property predictor
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statusChip}
            <BackendSettings onConnected={probeBackend} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
        <div className="container relative py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary-glow" />
              <span className="font-mono uppercase tracking-wider text-muted-foreground">
                ML + physics fusion · 26 material families
              </span>
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              <span className="text-gradient">Predict material properties</span>
              <br />
              from composition &amp; process.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              LatERAL fuses a 490 k-parameter neural surrogate with an aerospace-grade physics engine
              to predict density, strength, hardness, microstructure and more — for nickel
              superalloys, titanium, steels, HEAs, refractory ceramics, carbide composites and more.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById("workbench")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Open workbench
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-border bg-surface-elevated/60 backdrop-blur"
              >
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
              {[
                { label: "Material families", value: "26" },
                { label: "Model params", value: "490 k" },
                { label: "Validation R²", value: "0.85" },
                { label: "Properties / run", value: "20+" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-elevated/80 p-4">
                  <div className="font-display text-2xl font-semibold tabular-nums">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workbench */}
      <section id="workbench" className="container pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left rail: presets */}
          <aside className="lg:col-span-4">
            <Card className="glass-card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
              <PresetGallery selectedId={presetId} onSelect={onPreset} />
            </Card>
          </aside>

          {/* Right: editors + run + results */}
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

            {/* Results / loader / placeholder */}
            {mutation.isPending ? (
              <SimulationLoader />
            ) : response ? (
              <div className="space-y-3">
                <ResultsPanel results={response.results} />
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
                  <span className="font-medium text-foreground">Run simulation</span>. Results appear here
                  in a few seconds.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/60 bg-surface/40">
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              How LatERAL predicts properties
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hybrid pipeline — neural surrogate where it’s reliable, full physics where it isn’t.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Robust classification",
                body: "Dominant-element + binary/ternary rules identify the material family from composition alone. Inconel 718, Ti-6Al-4V, HEAs, refractory carbides, and more — all 26 families recognized.",
                icon: Beaker,
              },
              {
                step: "02",
                title: "ML inference",
                body: "A 490 k-parameter PyTorch surrogate (R² ≈ 0.85) predicts density and lattice geometry with quantile normalization and uncertainty quantification. Bypassed for out-of-distribution inputs.",
                icon: Cpu,
              },
              {
                step: "03",
                title: "Aerospace physics",
                body: "An AS9100-grade physics engine validates and refines: Hall-Petch, γ′ precipitation, β-transus, carbide fractions, porosity, melting points and service temperatures.",
                icon: FlaskConical,
              },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.step}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Card className="glass-card h-full p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{c.step}</span>
                      <Icon className="h-4 w-4 text-primary-glow" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <BrandMark size={20} />
            <span className="font-mono uppercase tracking-wider">LatERAL v4.1</span>
            <span>·</span>
            <span>Production-grade material informatics</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://huggingface.co/docs/hub/spaces-sdks-docker"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Hugging Face docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
