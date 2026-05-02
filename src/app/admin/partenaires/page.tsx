import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, BarChart3, Link2 } from "lucide-react";
import CopyableLinkBlock from "./CopyableLinkBlock";

export const dynamic = "force-dynamic";

type ClickRow = {
  id: string;
  partner_code: string;
  target_url: string;
  referer: string | null;
  user_agent: string | null;
  created_at: string;
};

type AggregateRow = {
  partner_code: string;
  clicks_total: number;
  clicks_7j: number;
  last_click: string;
};

async function fetchData(): Promise<{
  agg: AggregateRow[];
  recent: ClickRow[];
}> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Récupère tous les clics pour agréger côté JS (volume faible attendu)
  const { data: allClicks } = await supabase
    .from("partner_clicks")
    .select("partner_code, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const map = new Map<
    string,
    { clicks_total: number; clicks_7j: number; last_click: string }
  >();

  for (const row of allClicks || []) {
    const code = row.partner_code as string;
    const createdAt = row.created_at as string;
    const existing = map.get(code) || {
      clicks_total: 0,
      clicks_7j: 0,
      last_click: createdAt,
    };
    existing.clicks_total += 1;
    if (new Date(createdAt) >= sevenDaysAgo) existing.clicks_7j += 1;
    if (new Date(createdAt) > new Date(existing.last_click)) {
      existing.last_click = createdAt;
    }
    map.set(code, existing);
  }

  const agg: AggregateRow[] = Array.from(map.entries())
    .map(([partner_code, v]) => ({ partner_code, ...v }))
    .sort((a, b) => b.clicks_total - a.clicks_total);

  const { data: recentRaw } = await supabase
    .from("partner_clicks")
    .select("id, partner_code, target_url, referer, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const recent = (recentRaw || []) as ClickRow[];

  return { agg, recent };
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default async function AdminPartenairesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin/partenaires");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">
            Cette page est réservée aux administrateurs.
          </p>
          <Link href="/" className="text-[#0066CC] hover:underline text-sm">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  const { agg, recent } = await fetchData();
  const totalClicks = agg.reduce((s, r) => s + r.clicks_total, 0);
  const total7j = agg.reduce((s, r) => s + r.clicks_7j, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-[#0066CC]" />
            <h1 className="text-2xl font-bold text-gray-900">
              Partenaires — clics trackés
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Stats agrégées et derniers clics sur les liens partenaires
            (/api/r/[code]).
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Clics totaux
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalClicks.toLocaleString("fr-FR")}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Clics 7 derniers jours
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {total7j.toLocaleString("fr-FR")}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Codes actifs
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {agg.length}
            </div>
          </div>
        </div>

        {/* Comment générer un lien */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Link2 className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Format des liens trackés
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                Donnez à chaque partenaire un lien de la forme :{" "}
                <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-xs">
                  https://roullepro.com/api/r/CODE?to=URL_HTTPS_DESTINATION
                </code>
              </p>
              <CopyableLinkBlock />
              <p className="text-xs text-gray-500 mt-3">
                Le code accepte lettres, chiffres, tiret et underscore (2–40
                caractères). L&apos;URL cible doit être en HTTPS.
              </p>
            </div>
          </div>
        </div>

        {/* Tableau agrégé */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Stats par code</h2>
          </div>
          {agg.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Aucun clic enregistré pour l&apos;instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Code</th>
                    <th className="text-right px-5 py-3 font-medium">Total</th>
                    <th className="text-right px-5 py-3 font-medium">7 j</th>
                    <th className="text-left px-5 py-3 font-medium">
                      Dernier clic
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agg.map((row) => (
                    <tr key={row.partner_code}>
                      <td className="px-5 py-3 font-mono text-gray-900">
                        {row.partner_code}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold">
                        {row.clicks_total.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {row.clicks_7j.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {formatDate(row.last_click)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Derniers clics */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              50 derniers clics
            </h2>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Aucun clic enregistré pour l&apos;instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-left px-5 py-3 font-medium">Code</th>
                    <th className="text-left px-5 py-3 font-medium">Cible</th>
                    <th className="text-left px-5 py-3 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-900">
                        {row.partner_code}
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-xs">
                        <a
                          href={row.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0066CC] hover:underline break-all"
                          title={row.target_url}
                        >
                          {truncate(row.target_url, 60)}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                        {row.referer ? truncate(row.referer, 50) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
