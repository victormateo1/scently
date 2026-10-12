import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/scently/Logo";
import hero from "@/assets/auth-hero.jpg";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Scently" },
      { name: "description", content: "Accede a tu colección privada de perfumes en Scently." },
      { property: "og:title", content: "Iniciar sesión — Scently" },
      { property: "og:description", content: "Accede a tu colección privada de perfumes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "Correo o contraseña incorrectos.";
  if (/not confirmed/i.test(msg)) return "Confirma tu correo antes de iniciar sesión.";
  if (/already registered|already exists/i.test(msg)) return "Ya existe una cuenta con este correo.";
  if (/password.*(6|characters)/i.test(msg)) return "La contraseña debe tener al menos 8 caracteres.";
  if (/pwned|leaked|weak/i.test(msg)) return "Esta contraseña es demasiado común. Elige otra.";
  if (/rate limit/i.test(msg)) return "Demasiados intentos. Espera unos minutos.";
  return "No se ha podido completar la operación. Inténtalo de nuevo.";
}

function safeRedirect(r?: string) {
  if (!r) return "/dashboard";
  try {
    const u = new URL(r, window.location.origin);
    if (u.origin !== window.location.origin) return "/dashboard";
    return u.pathname + u.search;
  } catch {
    return "/dashboard";
  }
}

function AuthPage() {
  const { redirect: r } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const emailOk = z.string().email().safeParse(email.trim()).success;
    if (!emailOk) return void toast.error("Introduce un correo electrónico válido.");
    if (mode !== "forgot" && password.length < 8) return void toast.error("La contraseña debe tener al menos 8 caracteres.");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Bienvenido de nuevo");
        navigate({ to: safeRedirect(r), replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() || undefined } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setSent("Te hemos enviado un correo para confirmar tu cuenta. Ábrelo para empezar.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.");
      }
    } catch (err) {
      toast.error(translate((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return void toast.error("No se ha podido iniciar sesión con Google.");
    if (result.redirected) return;
    navigate({ to: safeRedirect(r), replace: true });
  }

  return (
    <div className="bg-aurora grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={hero} alt="Frasco de perfume sobre seda" width={1024} height={1344} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-coffee/80 via-coffee/10 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-ivory">
          <p className="font-display text-5xl leading-tight italic">Cada fragancia,<br />en su lugar.</p>
          <p className="mt-4 max-w-sm text-sm text-ivory/80">Tu colección privada: lo que queda en cada frasco, su historia y el perfume perfecto para hoy.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="glass fade-up w-full max-w-md rounded-3xl p-8 sm:p-10">
          <Logo />
          {sent ? (
            <div className="mt-8 space-y-4">
              <h1 className="text-3xl">Revisa tu correo</h1>
              <p className="text-sm text-muted-foreground">{sent}</p>
              <Button variant="outline" className="w-full rounded-full" onClick={() => { setSent(null); setMode("login"); }}>
                Volver a iniciar sesión
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-8 text-4xl">
                {mode === "login" ? "Bienvenido" : mode === "signup" ? "Crea tu cuenta" : "Recuperar contraseña"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login" ? "Accede a tu colección de fragancias." : mode === "signup" ? "Empieza a organizar tus perfumes." : "Te enviaremos un enlace para crear una nueva."}
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="h-12 rounded-xl" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      {mode === "login" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-muted-foreground hover:text-foreground">
                          ¿La has olvidado?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl" />
                  </div>
                )}
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base">
                  {loading ? "Un momento…" : mode === "login" ? "Iniciar sesión" : mode === "signup" ? "Crear cuenta" : "Enviar enlace"}
                </Button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
                  </div>
                  <Button type="button" variant="outline" onClick={google} className="h-12 w-full rounded-full bg-card">
                    Continuar con Google
                  </Button>
                </>
              )}

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>¿No tienes cuenta? <button className="font-medium text-foreground underline-offset-4 hover:underline" onClick={() => setMode("signup")}>Regístrate</button></>
                ) : (
                  <>¿Ya tienes cuenta? <button className="font-medium text-foreground underline-offset-4 hover:underline" onClick={() => setMode("login")}>Inicia sesión</button></>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
