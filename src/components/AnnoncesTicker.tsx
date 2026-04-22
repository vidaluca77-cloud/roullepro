"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Radio, ArrowUpRight } from "lucide-react";

type AnnonceLive = {
  id: string;
  title: string | null;
  price: number | null;
  city: string | null;
  categories?: { name: string | null; slug: string | null } | null;
  created_at: string;
};

type Props = {
  initial: AnnonceLive[];
};

function formatPrix(p: number | null): string {
  if (!p) return "Prix sur demande";
  return new Intl.NumberFormat("fr-FR").format(p) + " EUR";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "a l'instant";
  if (m < 60) return "il y a " + m + " min";
  const h = Math.floor(m / 60);
  if (h < 24) return "il y a " + h + " h";
  const d = Math.floor(h / 24);
  return "il y a " + d + " j";
}

export default function AnnoncesTicker({ initial }: Props) {
  const [items, setItems] = useState<AnnonceLive[]>(initial);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("annonces-ticker")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "annonces",
          filter: "status=eq.active",
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            title: string | null;
            price: number | null;
            city: string | null;
            category_id: string | null;
            created_at: string;
          };

          // Recharger la ligne complete avec la categorie jointe
          let categories: AnnonceLive["categories"] = null;
          if (row.category_id) {
            const { data } = await supabase
              .from("categories")
              .select("name, slug")
              .eq("id", row.category_id)
              .maybeSingle();
            categories = data as AnnonceLive["categories"];
          }

          const next: AnnonceLive = {
            id: row.id,
            title: row.title,
            price: row.price,
            city: row.city,
            categories,
            created_at: row.created_at,
          };

          setItems((prev) => {
            if (prev.some((x) => x.id === next.id)) return prev;
            return [next, ...prev].slice(0, 12);
          });
          setFlashId(next.id);
          setTimeout(() => setFlashId(null), 2500);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) return null;

  // Duplication pour defilement infini sans saut visible
  const doubled = [...items, ...items];

  return (
    <section
      aria-label="Dernieres annonces en temps reel"
      className="border-y border-slate-200 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-4">
        <div className="shrink-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Radio size={14} className="text-slate-700" />
          <span className="hidden sm:inline">En direct</span>
        </div>

        <div
          className="relative flex-1 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)",
          }}
        >
          <div className="flex gap-3 whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
            {doubled.map((a, i) => (
              <Link
                key={a.id + "-" + i}
                href={"/annonces/" + a.id}
                className={
                  "shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition " +
                  (flashId === a.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-900 hover:bg-white")
                }
              >
                {flashId === a.id && (
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">
                    Nouveau
                  </span>
                )}
                {a.categories?.name && (
                  <span className="text-slate-500">{a.categories.name}</span>
                )}
                <span className="font-semibold text-slate-900 max-w-[240px] truncate">
                  {a.title || "Annonce"}
                </span>
                {a.city && (
                  <span className="text-slate-500">- {a.city}</span>
                )}
                <span className="font-semibold text-blue-600">{formatPrix(a.price)}</span>
                <span className="text-slate-400">- {timeAgo(a.created_at)}</span>
                <ArrowUpRight size={12} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
