"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function RunIngestButton({
  action,
}: {
  action: (
    dryRun: boolean
  ) => Promise<{ ok: boolean; result?: unknown; error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const run = (dryRun: boolean) => {
    setMessage("");
    setStatus("idle");
    startTransition(async () => {
      const res = await action(dryRun);
      if (!res.ok) {
        setStatus("err");
        setMessage(res.error || "Échec");
        return;
      }
      setStatus("ok");
      const result = res.result as
        | { totals?: { fetched?: number; matched?: number; inserted?: number; duplicates?: number } }
        | undefined;
      const t = result?.totals;
      setMessage(
        `Fetched ${t?.fetched ?? 0} · Match ${t?.matched ?? 0} · Inserted ${t?.inserted ?? 0} · Doublons ${t?.duplicates ?? 0}`
      );
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => run(false)}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition disabled:bg-blue-300"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Lancer une ingestion maintenant
      </button>
      <button
        type="button"
        onClick={() => run(true)}
        disabled={pending}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Dry run
      </button>
      {message && (
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${
            status === "ok" ? "text-green-700" : "text-red-700"
          }`}
        >
          {status === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {message}
        </span>
      )}
    </div>
  );
}
