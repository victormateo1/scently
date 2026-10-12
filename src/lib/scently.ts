import type { Database } from "@/integrations/supabase/types";

export type Perfume = Database["public"]["Tables"]["perfumes"]["Row"];
export type PerfumeInsert = Database["public"]["Tables"]["perfumes"]["Insert"];
export type HistoryRow = Database["public"]["Tables"]["perfume_history"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type Opt = { value: string; label: string };
const opts = (o: Record<string, string>): Opt[] => Object.entries(o).map(([value, label]) => ({ value, label }));

export const CONCENTRATIONS = opts({
  edc: "Eau de Cologne",
  edt: "Eau de Toilette",
  edp: "Eau de Parfum",
  parfum: "Parfum",
  extrait: "Extrait de Parfum",
  otro: "Otro",
});
export const FAMILIES = opts({
  citrica: "Cítrica",
  amaderada: "Amaderada",
  floral: "Floral",
  oriental: "Oriental / Ámbar",
  aromatica: "Aromática",
  fresca: "Fresca",
  especiada: "Especiada",
  gourmand: "Gourmand",
  otra: "Otra",
});
export const SILLAGES = opts({ intima: "Íntima", moderada: "Moderada", notable: "Notable", intensa: "Intensa" });
export const STATUSES = opts({ favorita: "Favorita", en_uso: "En uso", ocasional: "Ocasional", archivada: "Archivada" });
export const OCCASIONS = opts({
  diario: "Uso diario",
  trabajo: "Trabajo o estudios",
  citas: "Citas",
  formal: "Eventos formales",
  noche: "Fiesta y noche",
  deporte: "Deporte",
  especial: "Ocasiones especiales",
});
export const SEASONS = opts({ primavera: "Primavera", verano: "Verano", otono: "Otoño", invierno: "Invierno" });
export const CLIMATES = opts({ calor: "Calor", templado: "Clima templado", frio: "Frío", todo: "Todo el año" });
export const DAYTIMES = opts({ dia: "Día", noche: "Noche", ambos: "Día y noche" });
export const FORMALITIES = opts({ casual: "Casual", smart: "Smart casual", formal: "Formal" });
export const INTENSITIES = opts({ "1": "Muy suave", "2": "Suave", "3": "Media", "4": "Fuerte", "5": "Muy fuerte" });

export function label(list: Opt[], v?: string | null) {
  return list.find((o) => o.value === v)?.label ?? v ?? "—";
}

export function pct(p: Pick<Perfume, "remaining_ml" | "size_ml">) {
  const size = Number(p.size_ml);
  if (!size) return 0;
  return Math.max(0, Math.min(100, (Number(p.remaining_ml) / size) * 100));
}

export type Level = "full" | "mid" | "low" | "empty";
export function level(percent: number): Level {
  if (percent <= 0) return "empty";
  if (percent < 15) return "low";
  if (percent <= 50) return "mid";
  return "full";
}
export const LEVEL_LABEL: Record<Level, string> = {
  full: "Nivel suficiente",
  mid: "Consumo avanzado",
  low: "A punto de agotarse",
  empty: "Frasco terminado",
};

export function fmtMoney(n: number | null | undefined, currency = "EUR") {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(Number(n));
}
export function fmtDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!d) return "—";
  const date = d.length === 10 ? new Date(d + "T00:00:00") : new Date(d);
  return date.toLocaleDateString("es-ES", opts);
}
export function fmtMl(n: number | null | undefined) {
  if (n == null) return "—";
  return `${Number(n).toLocaleString("es-ES", { maximumFractionDigits: 1 })} ml`;
}

export function csvEscape(v: unknown) {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join("|") : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
