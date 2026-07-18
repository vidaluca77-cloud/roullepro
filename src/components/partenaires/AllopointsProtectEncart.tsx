import { ShieldCheck, ArrowRight } from "lucide-react";

export const ALLOPOINTS_PROTECT_URL =
  "https://www.allopoints.fr/protect/?utm_source=https%3A%2F%2Froullepro.com%2F&utm_campaign=Roullepro5";

export default function AllopointsProtectEncart() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-blue-50 border border-amber-100 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-amber-700" />
        <h3 className="font-semibold text-gray-900">
          Protégez votre permis, c&apos;est votre outil de travail
        </h3>
        <span className="ml-auto inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white">
          −5 % avec RoullePro
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Allopoints Protect fait contester vos contraventions avec perte de points
        par des avocats certifiés spécialistes du droit routier (95 % de réussite).
        Pour un taxi, un ambulancier ou un VSL, préserver son permis, c&apos;est
        préserver son activité.
      </p>
      <a
        href={ALLOPOINTS_PROTECT_URL}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex items-center gap-1.5 text-sm bg-amber-700 hover:bg-amber-800 text-white font-semibold px-4 py-2 rounded-xl transition"
      >
        Découvrir Allopoints Protect
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
      <p className="text-[11px] text-gray-500 mt-2">
        Lien partenaire — voir mentions légales.
      </p>
    </div>
  );
}
