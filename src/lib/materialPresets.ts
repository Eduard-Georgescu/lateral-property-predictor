/**
 * Curated material presets — exact compositions known to LatERAL's classifier.
 * Pulled directly from material_classifier_enhanced.py so users get
 * deterministic, recognizable starting points.
 */

import type { ProcessParams } from "@/lib/lateralApi";

export interface MaterialPreset {
  id: string;
  name: string;
  family:
    | "Nickel Superalloy"
    | "Titanium Alloy"
    | "Steel"
    | "Aluminum Alloy"
    | "High-Entropy Alloy"
    | "Refractory / UHTC"
    | "Carbide Composite"
    | "Shape Memory Alloy"
    | "Intermetallic"
    | "Bulk Metallic Glass";
  description: string;
  composition: Record<string, number>;
  process: ProcessParams;
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: "inconel_718",
    name: "Inconel 718",
    family: "Nickel Superalloy",
    description: "Precipitation-hardened Ni superalloy. Aerospace gas-turbine workhorse.",
    composition: { Ni: 0.52, Cr: 0.19, Fe: 0.18, Nb: 0.05, Mo: 0.03, Ti: 0.01, Al: 0.005, C: 0.005 },
    process: { temp: 980, time: 1.0, cooling_rate: 50, aging_temp: 760, aging_time: 8 },
  },
  {
    id: "inconel_625",
    name: "Inconel 625",
    family: "Nickel Superalloy",
    description: "Solid-solution-strengthened. Marine, chemical, hot section components.",
    composition: { Ni: 0.62, Cr: 0.215, Mo: 0.09, Nb: 0.038, Fe: 0.025, Ti: 0.004, Al: 0.004, C: 0.004 },
    process: { temp: 1150, time: 0.5, cooling_rate: 80, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "cmsx4",
    name: "CMSX-4 Single Crystal",
    family: "Nickel Superalloy",
    description: "Single-crystal turbine-blade alloy. Re-bearing, ultra-high-T capable.",
    composition: { Ni: 0.616, Cr: 0.065, Co: 0.09, Mo: 0.006, W: 0.064, Ta: 0.065, Al: 0.056, Ti: 0.01, Re: 0.03, Hf: 0.001 },
    process: { temp: 1290, time: 6.0, cooling_rate: 5, aging_temp: 1080, aging_time: 4 },
  },
  {
    id: "ti64",
    name: "Ti-6Al-4V",
    family: "Titanium Alloy",
    description: "α+β titanium. Most-used Ti alloy — aerospace, biomedical, AM.",
    composition: { Ti: 0.90, Al: 0.06, V: 0.04 },
    process: { temp: 960, time: 1.0, cooling_rate: 40, aging_temp: 540, aging_time: 4 },
  },
  {
    id: "ti_cp",
    name: "Ti CP Grade 2",
    family: "Titanium Alloy",
    description: "Commercially-pure titanium. Corrosion-resistant, biomedical-grade.",
    composition: { Ti: 0.998, O: 0.0015, Fe: 0.0005 },
    process: { temp: 750, time: 1.0, cooling_rate: 5, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "ss316",
    name: "Stainless 316L (Austenitic)",
    family: "Steel",
    description: "Austenitic stainless. Cryogenic-to-high-T, corrosion-resistant.",
    composition: { Fe: 0.65, Cr: 0.17, Ni: 0.12, Mo: 0.025, Mn: 0.02, Si: 0.01, C: 0.0003 },
    process: { temp: 1050, time: 0.5, cooling_rate: 100, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "al7075",
    name: "Al 7075-T6",
    family: "Aluminum Alloy",
    description: "Highest-strength wrought Al. Aerospace structural alloy.",
    composition: { Al: 0.895, Zn: 0.057, Mg: 0.025, Cu: 0.016, Cr: 0.002, Fe: 0.003, Si: 0.002 },
    process: { temp: 480, time: 1.0, cooling_rate: 200, aging_temp: 120, aging_time: 24 },
  },
  {
    id: "al2024",
    name: "Al 2024-T3",
    family: "Aluminum Alloy",
    description: "Cu-bearing aerospace Al. Fuselage skin, wing structures.",
    composition: { Al: 0.93, Cu: 0.044, Mg: 0.015, Mn: 0.006, Fe: 0.003, Si: 0.002 },
    process: { temp: 495, time: 0.75, cooling_rate: 200, aging_temp: 25, aging_time: 96 },
  },
  {
    id: "cantor",
    name: "Cantor Alloy (CoCrFeMnNi)",
    family: "High-Entropy Alloy",
    description: "Equiatomic 5-element FCC HEA. Excellent cryogenic toughness.",
    composition: { Co: 0.20, Cr: 0.20, Fe: 0.20, Mn: 0.20, Ni: 0.20 },
    process: { temp: 1100, time: 1.0, cooling_rate: 50, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "refractory_hea",
    name: "Refractory HEA (NbTaTiW)",
    family: "Refractory / UHTC",
    description: "Refractory high-entropy alloy. Ultra-high-T structural research.",
    composition: { Nb: 0.25, Ta: 0.25, Ti: 0.25, W: 0.25 },
    process: { temp: 1400, time: 2.0, cooling_rate: 20, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "nitinol",
    name: "Nitinol (NiTi SMA)",
    family: "Shape Memory Alloy",
    description: "Equiatomic NiTi shape-memory alloy. Stents, actuators, eyewear.",
    composition: { Ni: 0.505, Ti: 0.495 },
    process: { temp: 850, time: 0.5, cooling_rate: 100, aging_temp: 450, aging_time: 1 },
  },
  {
    id: "wc_co",
    name: "WC-Co Cermet (10% Co)",
    family: "Carbide Composite",
    description: "Tungsten-carbide / cobalt cermet. Cutting tools, wear parts.",
    composition: { W: 0.84, C: 0.06, Co: 0.10 },
    process: { temp: 1450, time: 1.0, cooling_rate: 10, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "hfc",
    name: "Hafnium Carbide (HfC)",
    family: "Refractory / UHTC",
    description: "Ultra-high-T ceramic. Mp ≈ 3900 °C. Hypersonic leading edges.",
    composition: { Hf: 0.50, C: 0.50 },
    process: { temp: 2000, time: 1.0, cooling_rate: 5, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "tac",
    name: "Tantalum Carbide (TaC)",
    family: "Refractory / UHTC",
    description: "One of the highest-melting compounds known.",
    composition: { Ta: 0.50, C: 0.50 },
    process: { temp: 2000, time: 1.0, cooling_rate: 5, aging_temp: 0, aging_time: 0 },
  },
  {
    id: "tungsten",
    name: "Pure Tungsten",
    family: "Refractory / UHTC",
    description: "Highest-melting metal. Plasma-facing, electrodes, X-ray targets.",
    composition: { W: 1.0 },
    process: { temp: 1800, time: 2.0, cooling_rate: 5, aging_temp: 0, aging_time: 0 },
  },
];

/** Curated short list used for the home/quick-start tiles. */
export const FEATURED_PRESETS = [
  "inconel_718",
  "ti64",
  "ss316",
  "al7075",
  "cantor",
  "wc_co",
];

/** All chemical elements LatERAL's feature engineering knows about. */
export const KNOWN_ELEMENTS = [
  "H", "Li", "Be", "B", "C", "N", "O", "F", "Na", "Mg", "Al", "Si", "P", "S", "Cl",
  "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge",
  "As", "Se", "Br", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag",
  "Cd", "In", "Sn", "Sb", "Te", "I", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Sm", "Eu",
  "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir",
  "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Th", "U",
];
