import { createFileRoute } from "@tanstack/react-router";
import { PerfumeForm } from "@/components/scently/PerfumeForm";

export const Route = createFileRoute("/_authenticated/perfumes/new")({
  head: () => ({ meta: [{ title: "Añadir perfume" }] }),
  component: () => (
    <div className="fade-up space-y-6">
      <h1 className="text-4xl">Añadir perfume</h1>
      <PerfumeForm />
    </div>
  ),
});