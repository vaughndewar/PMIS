// Earned Value Management (EVM) engine — pure functions, no framework dependencies.

export interface EvmInputs {
  pv: number; // Planned Value
  ev: number; // Earned Value
  ac: number; // Actual Cost
  bac: number; // Budget at Completion
}

export interface EvmMetrics extends EvmInputs {
  cv: number; // Cost Variance = EV - AC
  sv: number; // Schedule Variance = EV - PV
  cpi: number; // Cost Performance Index = EV / AC
  spi: number; // Schedule Performance Index = EV / PV
  eac: number; // Estimate at Completion = BAC / CPI
  etc: number; // Estimate to Complete = EAC - AC
  vac: number; // Variance at Completion = BAC - EAC
  tcpi: number; // To-Complete Performance Index = (BAC - EV) / (BAC - AC)
}

function safeDivide(numerator: number, denominator: number, fallback: number): number {
  if (denominator === 0) return fallback;
  return numerator / denominator;
}

export function computeEvm(inputs: EvmInputs): EvmMetrics {
  const { pv, ev, ac, bac } = inputs;

  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = safeDivide(ev, ac, 1);
  const spi = safeDivide(ev, pv, 1);
  const eac = safeDivide(bac, cpi, bac);
  const etc = eac - ac;
  const vac = bac - eac;
  const tcpi = safeDivide(bac - ev, bac - ac, 1);

  return { pv, ev, ac, bac, cv, sv, cpi, spi, eac, etc, vac, tcpi };
}

export type HealthStatus = "green" | "amber" | "red";

/** CPI/SPI >= 1 is green, 0.9-1 is amber, below 0.9 is red. */
export function indexHealth(index: number): HealthStatus {
  if (index >= 1) return "green";
  if (index >= 0.9) return "amber";
  return "red";
}

/** Variance (CV/SV/VAC in dollars) health relative to a reference scale (typically BAC). */
export function varianceHealth(variance: number, scale: number): HealthStatus {
  if (variance >= 0) return "green";
  const ratio = scale === 0 ? 0 : Math.abs(variance) / scale;
  return ratio <= 0.05 ? "amber" : "red";
}
