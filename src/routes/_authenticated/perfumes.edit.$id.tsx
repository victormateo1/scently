import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PerfumeForm } from "@/components/scently/PerfumeForm";
import { perfumeQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/perfumes/edit/$id")({
  head: () => ({ meta: [{ title: "Editar perfume" }] }),
  component: Edit,
});

function Edit() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(perfumeQuery(id));
  if (isLoading) return <p>Cargando…</p>;
  if (!data) return <p className="text-muted-foreground">No se ha encontrado este perfume.</p>;
  return (
    <div className="fade-up space-y-6">
      <h1 className="text-4xl">Editar perfume</h1>
      <PerfumeForm key={data.id} initial={data} />
    </div>
  );
}