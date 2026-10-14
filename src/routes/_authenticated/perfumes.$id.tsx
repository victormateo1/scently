import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Heart, Pencil, SprayCan, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LevelBar, PerfumePhoto } from "@/components/scently/PerfumeBits";
import { adjustRemaining, registerSprays, removePhoto } from "@/lib/perfume-actions";
import { historyQuery, perfumeQuery, useCurrency, useInvalidateAll } from "@/lib/queries";
import {
  CLIMATES, CONCENTRATIONS, DAYTIMES, FAMILIES, FORMALITIES, INTENSITIES, LEVEL_LABEL,
  OCCASIONS, SEASONS, SILLAGES, fmtDate, fmtMl, fmtMoney, label, level, pct,
} from "@/lib/scently";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/perfumes/$id")({
  head: () => ({ meta: [{ title: "Perfume" }] }),
  component: Detail,
});

function Tags({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-foreground/5 px-3 py-1 text-xs">{i}</span>
      ))}
    </div>
  );
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const invalidate = useInvalidateAll();
  const currency = useCurrency();
  const { data: p, isLoading } = useQuery(perfumeQuery(id));
  const { data: history = [] } = useQuery(historyQuery(id));
  const [sprays, setSprays] = useState(0);
  const [adjust, setAdjust] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) return <p>Cargando…</p>;
  if (!p) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">No se ha encontrado este perfume.</p>
        <Button asChild variant="outline" className="rounded-full"><Link to="/perfumes">Volver a la colección</Link></Button>
      </div>
    );
  }

  const percent = pct(p);
  const sprayMl = Number(p.spray_ml);
  const remaining = Number(p.remaining_ml);

  async function saveSprays() {
    if (!p || !sprays) return;
    setBusy(true);
    try {
      await registerSprays(p.id, sprays);
      toast.success(sprays === 1 ? "1 pulsación registrada" : `${sprays} pulsaciones registradas`);
      setSprays(0);
      await invalidate();
    } catch (err) {
      console.error(err);
      toast.error("No se ha podido registrar el uso.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAdjust() {
    if (!p) return;
    const ml = parseFloat(adjust.replace(",", "."));
    if (!Number.isFinite(ml) || ml < 0 || ml > Number(p.size_ml)) {
      return void toast.error(`Introduce un valor entre 0 y ${p.size_ml} ml.`);
    }
    setBusy(true);
    try {
      await adjustRemaining(p.id, ml, "Ajuste manual");
      setAdjust("");
      await invalidate();
      toast.success("Cantidad actualizada");
    } catch (err) {
      console.error(err);
      toast.error("No se ha podido ajustar la cantidad.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFav() {
    if (!p) return;
    const { error } = await supabase.from("perfumes").update({ is_favorite: !p.is_favorite }).eq("id", p.id);
    if (error) return void toast.error("No se ha podido actualizar.");
    await invalidate();
  }

  async function remove() {
    if (!p || !window.confirm(`¿Eliminar ${p.brand} ${p.name}? Se borrará también su historial.`)) return;
    const { error } = await supabase.from("perfumes").delete().eq("id", p.id);
    if (error) return void toast.error("No se ha podido eliminar.");
    await removePhoto(p.photo_path).catch(() => {});
    await invalidate();
    navigate({ to: "/perfumes" });
  }

  return (
    <div className="fade-up space-y-6">
      <Link to="/perfumes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Colección
      </Link>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <PerfumePhoto path={p.photo_path} alt={`${p.brand} ${p.name}`} className="aspect-[4/5] w-full rounded-3xl" />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.brand}</p>
              <h1 className="font-display text-4xl leading-tight">{p.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {label(CONCENTRATIONS, p.concentration)} · {label(FAMILIES, p.family)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={toggleFav} aria-label="Favorita">
                <Heart className={cn("h-4 w-4", p.is_favorite && "fill-current text-rose-600")} />
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-full" aria-label="Editar">
                <Link to="/perfumes/edit/$id" params={{ id: p.id }}><Pencil className="h-4 w-4" /></Link>
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={remove} aria-label="Eliminar">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="glass space-y-3 rounded-2xl p-5">
            <div className="flex items-end justify-between">
              <p className="font-display text-4xl">{fmtMl(remaining)}</p>
              <p className="text-sm text-muted-foreground">de {fmtMl(p.size_ml)} · {Math.round(percent)}%</p>
            </div>
            <LevelBar perfume={p} />
            <p className="text-xs text-muted-foreground">
              {LEVEL_LABEL[level(percent)]} · unas {Math.floor(remaining / sprayMl)} pulsaciones
            </p>
          </div>

          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-sm text-muted-foreground">Registrar uso</p>
            <button
              type="button"
              aria-label="Añadir una pulsación"
              disabled={busy || remaining <= 0}
              onClick={() => setSprays((n) => Math.min(100, n + 1))}
              className="relative mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition active:scale-95 disabled:opacity-40"
            >
              <SprayCan className="h-12 w-12" />
              {sprays > 0 && (
                <span className="absolute -right-1 -top-1 flex h-9 min-w-9 items-center justify-center rounded-full bg-card px-2 text-base font-semibold text-foreground shadow">
                  {sprays}
                </span>
              )}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              {sprays ? `${sprays} × ${fmtMl(sprayMl)} = ${fmtMl(sprays * sprayMl)}` : "Toca el spray por cada pulsación"}
            </p>
            {sprays > 0 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setSprays(0)}>Borrar</Button>
                <Button type="button" className="rounded-full" disabled={busy} onClick={saveSprays}>Guardar</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass space-y-1 rounded-3xl p-6">
          <h2 className="mb-2 font-display text-2xl">Características</h2>
          <dl className="divide-y divide-border">
            <Row k="Salida"><Tags items={p.top_notes} /></Row>
            <Row k="Corazón"><Tags items={p.heart_notes} /></Row>
            <Row k="Fondo"><Tags items={p.base_notes} /></Row>
            <Row k="Estaciones"><Tags items={p.seasons.map((v) => label(SEASONS, v))} /></Row>
            <Row k="Clima"><Tags items={p.climate.map((v) => label(CLIMATES, v))} /></Row>
            <Row k="Ocasiones"><Tags items={p.occasions.map((v) => label(OCCASIONS, v))} /></Row>
            <Row k="Momento">{label(DAYTIMES, p.daytime)}</Row>
            <Row k="Formalidad">{label(FORMALITIES, p.formality)}</Row>
            <Row k="Intensidad">{label(INTENSITIES, p.intensity?.toString())}</Row>
            <Row k="Estela">{label(SILLAGES, p.sillage)}</Row>
            <Row k="Duración">{p.longevity_hours != null ? `${p.longevity_hours} h` : "—"}</Row>
            <Row k="Valoración">{p.rating != null ? `${p.rating} / 5` : "—"}</Row>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="glass space-y-1 rounded-3xl p-6">
            <h2 className="mb-2 font-display text-2xl">Compra</h2>
            <dl className="divide-y divide-border">
              <Row k="Precio">{fmtMoney(p.price, currency)}</Row>
              <Row k="Precio por ml">{p.price != null ? fmtMoney(Number(p.price) / Number(p.size_ml), currency) : "—"}</Row>
              <Row k="Fecha">{fmtDate(p.purchase_date)}</Row>
              <Row k="Tienda">{p.store ?? "—"}</Row>
            </dl>
            {p.notes && <p className="pt-3 text-sm text-muted-foreground">{p.notes}</p>}
          </section>

          <section className="glass space-y-3 rounded-3xl p-6">
            <h2 className="font-display text-2xl">Ajustar cantidad</h2>
            <p className="text-sm text-muted-foreground">Si has pesado el frasco o te has equivocado, fija los ml que quedan.</p>
            <div className="flex gap-2">
              <Input type="number" step="any" min="0" value={adjust} onChange={(e) => setAdjust(e.target.value)} placeholder="ml restantes" className="h-11 rounded-xl" />
              <Button type="button" variant="outline" className="h-11 rounded-full" disabled={busy || !adjust} onClick={saveAdjust}>Ajustar</Button>
            </div>
          </section>
        </div>
      </div>

      <section className="glass rounded-3xl p-6">
        <h2 className="mb-3 font-display text-2xl">Historial</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no has registrado usos.</p>
        ) : (
          <ul className="divide-y divide-border">
            {[...history].reverse().slice(0, 20).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span>{h.note ?? (h.kind === "spray" ? "Uso" : "Ajuste")}</span>
                <span className="text-muted-foreground">
                  {fmtMl(h.diff_ml)} · {fmtDate(h.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}