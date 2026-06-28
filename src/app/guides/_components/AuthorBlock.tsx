import { AUTHORS } from "@/lib/authors";

type Props = {
  authorKey?: string;
  publishedAt: string; // ISO
  updatedAt: string;   // ISO
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function AuthorBlock({ authorKey = "lucas-horville", publishedAt, updatedAt }: Props) {
  const author = AUTHORS[authorKey as keyof typeof AUTHORS];
  if (!author) return null;

  const sameAs = author.sameAs[0];

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-200 mb-6">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-lg" aria-hidden="true">
          {author.name.split(" ").map((n) => n[0]).join("")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={sameAs}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-900 hover:text-blue-700 text-sm"
          >
            {author.name}
          </a>
          <span className="text-slate-400 text-xs">·</span>
          <span className="text-slate-500 text-xs">{author.jobTitle}</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-3">
          <span>Publié le {formatDate(publishedAt)}</span>
          {updatedAt !== publishedAt && (
            <span>Mis à jour le {formatDate(updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
