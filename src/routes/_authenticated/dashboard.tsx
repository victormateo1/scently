import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { perfumesQuery } from "@/lib/queries";
import { fmtMl, pct } from "@/lib/scently";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Inicio" },
      { name: "description", content: "Resumen de tu colección de perfumes." },
      { property: "og:title", content: "Inicio" },
      { property: "og:description", content: "Resumen de tu colección de perfumes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data = [], isLoading } = useQuery(perfumesQuery);
  const total = data.reduce((s, p) => s + Number(p.remaining_ml), 0);
  const low = data.filter((p) => pct(p) < 15).length;
  return (
    <div className="fade-up space-y-6">
      <h1 className="text-4xl">Hola de nuevo</h1>
      <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link to="/perfumes">Ver mi colección</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/perfumes/new"><Plus className="h-4 w-4" /> Añadir perfume</Link>
        </Button>
      </div>
      {isLoading ? <p>Cargando…</p> : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5"><p className="text-sm text-muted-foreground">Mi colección</p><p className="font-display text-4xl">{data.length}</p></div>
          <div className="glass rounded-2xl p-5"><p className="text-sm text-muted-foreground">Cantidad restante</p><p className="font-display text-4xl">{fmtMl(total)}</p></div>
          <div className="glass rounded-2xl p-5"><p className="text-sm text-muted-foreground">Por agotarse</p><p className="font-display text-4xl">{low}</p></div>
        </div>
      )}
      {!isLoading && data.length === 0 && <p className="text-muted-foreground">Aún no tienes perfumes registrados.</p>}
    </div>
  );
}