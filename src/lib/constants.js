export const STAGES = ["New", "Contacted", "Engaged", "Qualified", "Proposal", "Customer"];

export const STAGE_COLOR = {
  New: "#5B6B85",
  Contacted: "#3F8CA6",
  Engaged: "#2CA6C4",
  Qualified: "#1FC2DE",
  Proposal: "#17D6E8",
  Customer: "#22E9F2",
  Lost: "#E8674A",
};

export const ACCENT = "#22D3EE";
export const ACCENT_DIM = "#0E7A8C";
export const RUST = "#F0A344";

export const BG = "#080C16";
export const SURFACE = "#0E1526";
export const SURFACE_2 = "#121B30";
export const BORDER = "#1F2B45";
export const TEXT = "#E8EDF5";
export const TEXT_MUTED = "#7A8AA6";
export const TEXT_FAINT = "#4C5A76";

export function daysBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

export function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function todayISO() {
  return new Date().toISOString();
}
