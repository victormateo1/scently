import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/scently/Logo";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nueva contraseña" },
      { name: "description", content: "Establece una nueva contraseña para tu cuenta de Scently." },
      { property: "og:title", content: "Nueva contraseña" },
      { property: "og:description", content: "Restablece el acceso a tu colección." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && (isRecovery || data.session)) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("La contraseña debe tener al menos 8 caracteres.");
    if (pw !== pw2) return void toast.error("Las contraseñas no coinciden.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return void toast.error("No se ha podido actualizar la contraseña. Solicita un nuevo enlace.");
    toast.success("Contraseña actualizada");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="bg-aurora flex min-h-screen items-center justify-center px-5">
      <div className="glass fade-up w-full max-w-md rounded-3xl p-8 sm:p-10">
        <Logo />
        <h1 className="mt-8 text-4xl">Nueva contraseña</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">Abre esta página desde el enlace que te enviamos por correo. Si ha caducado, solicita uno nuevo desde el inicio de sesión.</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw">Nueva contraseña</Label>
              <Input id="pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw2">Repite la contraseña</Label>
              <Input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="h-12 rounded-xl" />
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-full">{loading ? "Guardando…" : "Guardar contraseña"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
