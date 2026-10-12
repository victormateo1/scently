import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { HistoryRow, Perfume, Profile, Purchase } from "./scently";

export const perfumesQuery = queryOptions({
  queryKey: ["perfumes"],
  queryFn: async (): Promise<Perfume[]> => {
    const { data, error } = await supabase.from("perfumes").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const perfumeQuery = (id: string) =>
  queryOptions({
    queryKey: ["perfumes", id],
    queryFn: async (): Promise<Perfume | null> => {
      const { data, error } = await supabase.from("perfumes").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const historyQuery = (perfumeId?: string) =>
  queryOptions({
    queryKey: ["history", perfumeId ?? "all"],
    queryFn: async (): Promise<HistoryRow[]> => {
      let q = supabase.from("perfume_history").select("*").order("created_at", { ascending: true });
      if (perfumeId) q = q.eq("perfume_id", perfumeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const purchasesQuery = queryOptions({
  queryKey: ["purchases"],
  queryFn: async (): Promise<Purchase[]> => {
    const { data, error } = await supabase.from("purchases").select("*").order("purchase_date", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data;
  },
});

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async (): Promise<Profile | null> => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["perfumes"] }),
      qc.invalidateQueries({ queryKey: ["history"] }),
      qc.invalidateQueries({ queryKey: ["purchases"] }),
    ]);
}

export function usePhotoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["photo", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("perfume-photos").createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export function useCurrency() {
  const { data } = useQuery(profileQuery);
  return data?.currency ?? "EUR";
}
