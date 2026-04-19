/**
 * LatERAL backend client.
 * Points at the Hugging Face Space (or any FastAPI deployment) defined by
 * VITE_LATERAL_API. Set it in your project env (or .env.local) to your
 * Space URL, e.g. https://your-username-lateral.hf.space
 */

export interface ProcessParams {
  temp: number;
  time: number;
  cooling_rate: number;
  aging_temp?: number;
  aging_time?: number;
}

export interface SimulateRequest {
  composition: Record<string, number>;
  process: ProcessParams;
}

export interface SimulationResults {
  category: string;
  classification_confidence: number;
  ml_confidence: number;
  prediction_mode: string;
  crystal_system: string;
  lattice_a: number;
  lattice_c: number;
  volume: number;
  density: number;
  hardness: number;
  grain_size: number;
  yield_strength: number;
  fracture_toughness: number;
  phase: string;
  // Optional, depending on material class
  precipitate_fraction?: number;
  precipitate_size?: number;
  porosity?: number;
  relative_density?: number;
  hardness_hv?: number;
  elongation_pct?: number;
  melting_point_C?: number;
  max_service_temp_C?: number;
  T_solvus_C?: number;
  gamma_prime_fraction?: number;
  gamma_prime_size_nm?: number;
  f_alpha?: number;
  f_beta?: number;
  f_martensite?: number;
  beta_transus_C?: number;
  tic_fraction?: number;
  wc_fraction?: number;
  binder_fraction?: number;
  [key: string]: unknown;
}

export interface SimulateResponse {
  results: SimulationResults;
  log: string;
}

const DEFAULT_API =
  (import.meta.env.VITE_LATERAL_API as string | undefined)?.replace(/\/$/, "") ?? "";

export function getApiBase(): string {
  // Allow runtime override via localStorage so users can paste their HF Space URL
  // without rebuilding.
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem("lateral_api_base");
    if (override) return override.replace(/\/$/, "");
  }
  return DEFAULT_API;
}

export function setApiBase(url: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("lateral_api_base", url.replace(/\/$/, ""));
  }
}

export class LateralApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  if (!base) {
    throw new LateralApiError(
      "Backend URL not configured. Open Settings and paste your Hugging Face Space URL."
    );
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = (body?.detail as string) ?? detail;
    } catch {
      /* ignore */
    }
    throw new LateralApiError(`API ${res.status}: ${detail}`, res.status);
  }
  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<{ status: string; ml_available: boolean }> {
  return request("/health");
}

export async function simulate(payload: SimulateRequest): Promise<SimulateResponse> {
  return request("/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
