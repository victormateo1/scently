import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Scently — Organizador personal de perfumes" },
      { name: "description", content: "Scently organiza tu colección de perfumes: contenido restante, historial, estadísticas y qué fragancia usar hoy." },
      { property: "og:title", content: "Scently — Organizador personal de perfumes" },
      { property: "og:description", content: "Tu colección de fragancias, elegante y bajo control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/dashboard" : "/auth", replace: true });
  },
  component: () => null,
});
