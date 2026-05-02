"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyableLinkBlock() {
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("");
  const [copied, setCopied] = useState(false);

  const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const cleanTarget = target.trim();
  const valid =
    cleanCode.length >= 2 &&
    cleanCode.length <= 40 &&
    /^https:\/\/.+/.test(cleanTarget);

  const link = valid
    ? `https://roullepro.com/api/r/${cleanCode}?to=${encodeURIComponent(
        cleanTarget
      )}`
    : "";

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="code-partenaire"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
          maxLength={40}
        />
        <input
          type="url"
          placeholder="https://exemple-partenaire.fr/page"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
        />
      </div>
      {valid && (
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 break-all">
            {link}
          </code>
          <button
            onClick={copy}
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#0066CC] hover:bg-[#0052a3] text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copié
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
