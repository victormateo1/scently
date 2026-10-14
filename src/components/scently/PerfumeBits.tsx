import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotoUrl } from "@/lib/queries";
import { level, pct, type Level, type Perfume } from "@/lib/scently";

const COLORS: Record<Level, string> = {
  full: "bg-emerald-600/80",
  mid: "bg-amber-500/80",
  low: "bg-rose-600/80",
  empty: "bg-muted-foreground/40",
};

export function LevelBar({ perfume }: { perfume: Pick<Perfume, "remaining_ml" | "size_ml"> }) {
  const p = pct(perfume);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
      <div className={cn("h-full rounded-full transition-all", COLORS[level(p)])} style={{ width: `${p}%` }} />
    </div>
  );
}

export function PerfumePhoto({ path, alt, className }: { path: string | null; alt: string; className?: string }) {
  const { data: url } = usePhotoUrl(path);
  return (
    <div className={cn("overflow-hidden bg-foreground/5", className)}>
      {url ? (
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Droplets className="h-8 w-8 opacity-40" />
        </div>
      )}
    </div>
  );
}