

## Add sub-variants to each LatERAL process category

I pulled `process_workflow.py` from the live Hugging Face Space. Each of the 8 LatERAL processes has predefined sub-variants with calibrated defaults. Here's exactly what's in the Python source:

### Sub-variants per category (from LatERAL source)

**1. Solution heat treatment** — single variant (`temp`, `time`, `cool_rate`).

**2. Quench** — 4 named cooling media + custom:
- Water quench (~1000 °C/s)
- Oil quench (~200 °C/s)
- Air cool (~10 °C/s)
- Furnace cool (~1 °C/s)
- Custom rate

**3. Aging / Precipitation** — single variant with temp/time/cool.

**4. SPS — Spark Plasma Sintering** — single variant, but with extra params: `pressure (MPa)`, `heating_rate (°C/min)`, `green_density (%)`. Defaults: 1200 °C / 10 min / 50 MPa / 100 °C/min heating / 65% green.

**5. HIP — Hot Isostatic Pressing** — single variant, with `pressure (MPa)`. Defaults: 1200 °C / 4 h / 150 MPa.

**6. AM — Additive Manufacturing** — 2 sub-types + AM-specific params:
- SLM (Selective Laser Melting)
- EBM (Electron Beam Melting)
- Params: `power (W)`, `scan speed (mm/s)`, `layer thickness (µm)`, `hatch spacing (µm)` → energy density auto-computed.

**7. Stress Relief / Annealing** — single variant. Defaults: 650 °C / 2 h / 2 °C/s.

**8. Casting / Forging / Wrought** — 6 sub-types:
- Sand casting (1400 °C, 1 °C/s)
- Investment casting (1300 °C, 10 °C/s)
- Die casting (1100 °C, 100 °C/s)
- Forging (1050 °C, 10 °C/s)
- Wrought / rolled / extruded (950 °C, 20 °C/s, + reduction %)
- Custom conventional

### Implementation

**`src/lib/processSteps.ts`**
- Extend `StepKindMeta` with optional `variants: { id, label, hint, defaults: Partial<ProcessParams & {pressure?, heating_rate?, energy_density?, am_type?, reduction?}> }[]`.
- Populate variants for `quench` (4), `am` (2 with energy-density inputs), `casting` (6).
- Extend `ProcessStep` to carry `variantId?: string` and an optional `extras` bag for AM/SPS/HIP-specific fields (pressure, energy_density, am_type, etc.).
- Keep `ProcessParams` payload to backend unchanged — extras are UI-only metadata; cooling_rate / temp / time are filled from the chosen variant's defaults.

**`src/components/ProcessPipelineEditor.tsx`**
- When a step kind has variants, show a second small dropdown ("Variant") next to the kind label inside the card. Selecting a variant populates the numeric fields with that variant's defaults (user can still tweak).
- For AM, surface the 4 process-specific inputs (power, scan speed, layer, hatch) and live-compute energy density underneath.
- For SPS / HIP, show a `Pressure (MPa)` field.
- For Wrought, show a `Reduction (%)` field.

**`src/components/PipelineTimeline.tsx`** — show the variant name in parentheses after the step label (e.g. "Quench (Water)", "AM (SLM)", "Casting (Investment)") so a long pipeline reads clearly.

### What you'll see in the UI

Adding a **Quench** step now shows a Variant dropdown: Water / Oil / Air / Furnace / Custom — selecting Water sets cooling_rate to 1000 °C/s automatically.

Adding **AM** lets you pick SLM or EBM and dial in power / scan / layer / hatch — energy density updates live.

Adding **Casting / Forging / Wrought** lets you pick Sand / Investment / Die / Forging / Wrought / Custom — each preloads the matching temp + cooling rate from the LatERAL source.

