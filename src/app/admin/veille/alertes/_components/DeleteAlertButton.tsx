"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

type Props = {
  id: string;
  title: string;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
};

export default function DeleteAlertButton({ id, title, action }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    const ok = window.confirm(
      `Supprimer définitivement l'alerte « ${title} » ?\n\nCette action est irréversible. Vous pouvez aussi simplement la repasser en draft.`
    );
    if (!ok) return;
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const res = await action(fd);
      if (!res.ok) {
        setError(res.error || "Suppression échouée");
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 hover:border-red-400 text-red-700 text-xs font-semibold rounded-lg transition disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Supprimer
      </button>
      {error && (
        <span className="ml-2 text-xs text-red-600">{error}</span>
      )}
    </>
  );
}
