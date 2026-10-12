import { Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";

export function AppShell() {
  const navigate = useNavigate();
  return (
    <div className="bg-aurora min-h-screen">
      <header className="glass sticky top-0 z-10 flex items-center justify-between px-5 py-3">
        <Logo />
        <button
          className="rounded-full border border-input px-4 py-2 text-sm"
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}
        >
          Cerrar sesión
        </button>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8"><Outlet /></main>
    </div>
  );
}
