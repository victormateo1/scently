import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { removePhoto, uploadPhoto } from "@/lib/perfume-actions";
import { useCurrency, useInvalidateAll, usePhotoUrl } from "@/lib/queries";
import {
  CLIMATES, CONCENTRATIONS, DAYTIMES, FAMILIES, FORMALITIES, INTENSITIES,
  OCCASIONS, SEASONS, SILLAGES, STATUSES, type Perfume,
} from "@/lib/scently";

type Opt = { value: string; label: string };

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass space-y-4 rounded-3xl p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Select({ id, value, onChange, options, placeholder }: {
  id: string; value: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Chips({ options, value, onChange }: { options: Opt[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-accent",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function PerfumeForm({ initial }: { initial?: Perfume }) {
  const navigate = useNavigate();
  const invalidate = useInvalidateAll();
  const currency = useCurrency();
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeFlag, setRemoveFlag] = useState(false);
  const { data: currentUrl } = usePhotoUrl(initial?.photo_path);

  const [f, setF] = useState({
    brand: initial?.brand ?? "",
    name: initial?.name ?? "",
    concentration: initial?.concentration ?? "edp",
    family: initial?.family ?? "",
    status: initial?.status ?? "en_uso",
    top: initial?.top_notes.join(", ") ?? "",
    heart: initial?.heart_notes.join(", ") ?? "",
    base: initial?.base_notes.join(", ") ?? "",
    seasons: initial?.seasons ?? ([] as string[]),
    occasions: initial?.occasions ?? ([] as string[]),
    climate: initial?.climate ?? ([] as string[]),
    daytime: initial?.daytime ?? "",
    formality: initial?.formality ?? "",
    sillage: initial?.sillage ?? "",
    intensity: initial?.intensity?.toString() ?? "",
    longevity: initial?.longevity_hours?.toString() ?? "",
    rating: initial?.rating?.toString() ?? "",
    size: initial?.size_ml?.toString() ?? "100",
    remaining: "",
    sprayMl: initial?.spray_ml?.toString() ?? "0.1",
    price: initial?.price?.toString() ?? "",
    purchaseDate: initial?.purchase_date ?? "",
    store: initial?.store ?? "",
    notes: initial?.notes ?? "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const shown = preview ?? (removeFlag ? null : (currentUrl ?? null));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const size = num(f.size);
    const rating = num(f.rating);
    if (!f.brand.trim() || !f.name.trim()) return void toast.error("Marca y nombre son obligatorios.");
    if (!size || size <= 0) return void toast.error("Indica el tamaño del frasco en ml.");
    if (rating != null && (rating < 0 || rating > 5)) return void toast.error("La valoración va de 0 a 5.");

    setSaving(true);
    let uploaded: string | null = null;
    let saved = false;
    try {
      if (photo) uploaded = await uploadPhoto(photo);
      const photo_path = uploaded ?? (removeFlag ? null : (initial?.photo_path ?? null));
      const row = {
        brand: f.brand.trim(),
        name: f.name.trim(),
        concentration: f.concentration,
        family: f.family || null,
        status: f.status,
        top_notes: list(f.top),
        heart_notes: list(f.heart),
        base_notes: list(f.base),
        seasons: f.seasons,
        occasions: f.occasions,
        climate: f.climate,
        daytime: f.daytime || null,
        formality: f.formality || null,
        sillage: f.sillage || null,
        intensity: f.intensity ? Number(f.intensity) : null,
        longevity_hours: num(f.longevity),
        rating,
        size_ml: size,
        spray_ml: num(f.sprayMl) ?? 0.1,
        price: num(f.price),
        purchase_date: f.purchaseDate || null,
        store: f.store.trim() || null,
        notes: f.notes.trim() || null,
        photo_path,
      };

      if (initial) {
        const { error } = await supabase
          .from("perfumes")
          .update({ ...row, remaining_ml: Math.min(Number(initial.remaining_ml), size) })
          .eq("id", initial.id);
        if (error) throw error;
        saved = true;
        if (initial.photo_path && initial.photo_path !== photo_path) await removePhoto(initial.photo_path).catch(() => {});
        await invalidate();
        toast.success("Cambios guardados");
        navigate({ to: "/perfumes/$id", params: { id: initial.id } });
      } else {
        const remaining = Math.min(num(f.remaining) ?? size, size);
        const { data, error } = await supabase
          .from("perfumes")
          .insert({ ...row, remaining_ml: remaining })
          .select("id")
          .single();
        if (error) throw error;
        saved = true;
        await invalidate();
        toast.success("Perfume añadido");
        navigate({ to: "/perfumes/$id", params: { id: data.id } });
      }
    } catch (err) {
      console.error(err);
      if (uploaded && !saved) await removePhoto(uploaded).catch(() => {});
      toast.error("No se ha podido guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Foto">
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-foreground/5">
            {shown && <img src={shown} alt="Vista previa" className="h-full w-full object-cover" />}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-medium">
              <ImagePlus className="h-4 w-4" />
              {shown ? "Cambiar foto" : "Añadir foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhoto(file);
                    setRemoveFlag(false);
                  }
                  e.target.value = "";
                }}
              />
            </label>
            {shown && (
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => { setPhoto(null); setRemoveFlag(true); }}>
                Quitar
              </Button>
            )}
          </div>
        </div>
      </Section>

      <Section title="Datos básicos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marca" htmlFor="brand">
            <Input id="brand" value={f.brand} onChange={(e) => set("brand", e.target.value)} maxLength={80} required className="h-12 rounded-xl" />
          </Field>
          <Field label="Nombre" htmlFor="name">
            <Input id="name" value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={80} required className="h-12 rounded-xl" />
          </Field>
          <Field label="Concentración" htmlFor="concentration">
            <Select id="concentration" value={f.concentration} onChange={(v) => set("concentration", v)} options={CONCENTRATIONS} />
          </Field>
          <Field label="Familia olfativa" htmlFor="family">
            <Select id="family" value={f.family} onChange={(v) => set("family", v)} options={FAMILIES} placeholder="Sin especificar" />
          </Field>
          <Field label="Estado" htmlFor="status">
            <Select id="status" value={f.status} onChange={(v) => set("status", v)} options={STATUSES.filter((s) => s.value !== "favorita")} />
          </Field>
        </div>
      </Section>

      <Section title="Notas olfativas">
        <p className="text-sm text-muted-foreground">Sepáralas con comas.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Salida" htmlFor="top">
            <Input id="top" value={f.top} onChange={(e) => set("top", e.target.value)} placeholder="Bergamota, limón" className="h-12 rounded-xl" />
          </Field>
          <Field label="Corazón" htmlFor="heart">
            <Input id="heart" value={f.heart} onChange={(e) => set("heart", e.target.value)} placeholder="Jazmín, lavanda" className="h-12 rounded-xl" />
          </Field>
          <Field label="Fondo" htmlFor="base">
            <Input id="base" value={f.base} onChange={(e) => set("base", e.target.value)} placeholder="Vainilla, sándalo" className="h-12 rounded-xl" />
          </Field>
        </div>
      </Section>

      <Section title="Cuándo usarla">
        <Field label="Estaciones"><Chips options={SEASONS} value={f.seasons} onChange={(v) => set("seasons", v)} /></Field>
        <Field label="Clima"><Chips options={CLIMATES} value={f.climate} onChange={(v) => set("climate", v)} /></Field>
        <Field label="Ocasiones"><Chips options={OCCASIONS} value={f.occasions} onChange={(v) => set("occasions", v)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Momento del día" htmlFor="daytime">
            <Select id="daytime" value={f.daytime} onChange={(v) => set("daytime", v)} options={DAYTIMES} placeholder="Sin especificar" />
          </Field>
          <Field label="Formalidad" htmlFor="formality">
            <Select id="formality" value={f.formality} onChange={(v) => set("formality", v)} options={FORMALITIES} placeholder="Sin especificar" />
          </Field>
        </div>
      </Section>

      <Section title="Rendimiento">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Intensidad" htmlFor="intensity">
            <Select id="intensity" value={f.intensity} onChange={(v) => set("intensity", v)} options={INTENSITIES} placeholder="Sin especificar" />
          </Field>
          <Field label="Estela" htmlFor="sillage">
            <Select id="sillage" value={f.sillage} onChange={(v) => set("sillage", v)} options={SILLAGES} placeholder="Sin especificar" />
          </Field>
          <Field label="Duración (horas)" htmlFor="longevity">
            <Input id="longevity" type="number" step="0.5" min="0" value={f.longevity} onChange={(e) => set("longevity", e.target.value)} className="h-12 rounded-xl" />
          </Field>
          <Field label="Valoración (0–5)" htmlFor="rating">
            <Input id="rating" type="number" step="0.5" min="0" max="5" value={f.rating} onChange={(e) => set("rating", e.target.value)} className="h-12 rounded-xl" />
          </Field>
        </div>
      </Section>

      <Section title="Frasco">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tamaño (ml)" htmlFor="size">
            <Input id="size" type="number" step="any" min="1" value={f.size} onChange={(e) => set("size", e.target.value)} required className="h-12 rounded-xl" />
          </Field>
          {!initial && (
            <Field label="Cantidad actual (ml)" htmlFor="remaining">
              <Input id="remaining" type="number" step="any" min="0" value={f.remaining} onChange={(e) => set("remaining", e.target.value)} placeholder="Lleno" className="h-12 rounded-xl" />
            </Field>
          )}
          <Field label="ml por pulsación" htmlFor="sprayMl">
            <Input id="sprayMl" type="number" step="0.01" min="0.01" value={f.sprayMl} onChange={(e) => set("sprayMl", e.target.value)} className="h-12 rounded-xl" />
          </Field>
        </div>
      </Section>

      <Section title="Compra">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={`Precio (${currency})`} htmlFor="price">
            <Input id="price" type="number" step="0.01" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} className="h-12 rounded-xl" />
          </Field>
          <Field label="Fecha de compra" htmlFor="purchaseDate">
            <Input id="purchaseDate" type="date" value={f.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} className="h-12 rounded-xl" />
          </Field>
          <Field label="Tienda" htmlFor="store">
            <Input id="store" value={f.store} onChange={(e) => set("store", e.target.value)} maxLength={80} className="h-12 rounded-xl" />
          </Field>
        </div>
      </Section>

      <Section title="Notas personales">
        <textarea
          id="notes"
          value={f.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" className="h-12 rounded-full px-6" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="h-12 rounded-full px-8">
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Añadir perfume"}
        </Button>
      </div>
    </form>
  );
}