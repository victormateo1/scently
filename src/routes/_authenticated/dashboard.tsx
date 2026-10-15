import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LevelBar, PerfumePhoto } from "@/components/scently/PerfumeBits";
import { perfumesQuery, useInvalidateAll } from "@/lib/queries";
import { CONCENTRATIONS, fmtMl, label, pct } from "@/lib/scently";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Mi colección — Scently" },
      { name: "description", content: "Tu colección de perfumes." },
      { property: "og:title", content: "Mi colección — Scently" },
      { property: "og:description", content: "Tu colección de perfumes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data = [], isLoading } = useQuery(perfumesQuery);
  const invalidate = useInvalidateAll();
  const [q, setQ] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);

  const total = data.reduce((s, p) => s + Number(p.remaining_ml), 0);
  const low = data.filter((p) => pct(p) < 15).length;

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter(
      (p) => (!onlyFav || p.is_favorite) && (!t || `${p.brand} ${p.name}`.toLowerCase().includes(t)),
    );
  }, [data, q, onlyFav]);

  async function toggleFav(id: string, value: boolean) {
    const { error } = await supabase.from("perfumes").update({ is_favorite: value }).eq("id", id);
    if (error) return void toast.error("No se ha podido actualizar.");
    await invalidate();
  }

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Hola de nuevo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/perfumes/new"><Plus className="h-4 w-4" /> Añadir perfume</Link>
        </Button>
      </div>

      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-2xl p-5"><p className="text-sm text-muted-foreground">Mi colección</p><p className="font-display text-4xl">{data.length}</p></div>
            <div className="glass rounded-2xl p-5"><p className="text-sm text-muted-foreground">Cantidad restante</p><p className="font-display text-4xl">{fmtMl(total)}</p></div>
            <div className="glass rounded-2xl p-5"><p className="text-sm text-muted-foreground">Por agotarse</p><p className="font-display text-4xl">{low}</p></div>
          </div>

          {data.length === 0 ? (
            <p className="text-muted-foreground">Aún no tienes perfumes registrados.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por marca o nombre"
                  className="h-11 max-w-sm rounded-full bg-card"
                />
                <Button type="button" variant={onlyFav ? "default" : "outline"} className="h-11 rounded-full" onClick={() => setOnlyFav((v) => !v)}>
                  <Heart className="h-4 w-4" /> Favoritas
                </Button>
              </div>

              {shown.length === 0 ? (
                <p className="text-muted-foreground">Ningún perfume coincide.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((p) => (
                    <div key={p.id} className="glass relative overflow-hidden rounded-2xl">
                      <Link to="/perfumes/$id" params={{ id: p.id }} className="block">
                        <PerfumePhoto path={p.photo_path} alt={`${p.brand} ${p.name}`} className="aspect-[4/3] w-full" />
                        <div className="space-y-2 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                          <h2 className="font-display text-2xl leading-tight">{p.name}</h2>
                          <p className="text-xs text-muted-foreground">{label(CONCENTRATIONS, p.concentration)}</p>
                          <LevelBar perfume={p} />
                          <p className="text-xs text-muted-foreground">{fmtMl(p.remaining_ml)} de {fmtMl(p.size_ml)}</p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        aria-label={p.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                        onClick={() => toggleFav(p.id, !p.is_favorite)}
                        className="absolute right-3 top-3 rounded-full bg-card/80 p-2 backdrop-blur"
                      >
                        <Heart className={cn("h-4 w-4", p.is_favorite && "fill-current text-rose-600")} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
