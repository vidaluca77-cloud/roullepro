"use client";

import { useMemo } from "react";
import {
  MapPin,
  ArrowRight,
  Clock,
  Phone,
  Mail,
  Car,
  Cross,
  Stethoscope,
  CalendarDays,
  Download,
  FileSpreadsheet,
  History,
} from "lucide-react";
import { type TypeTransport } from "@/lib/transport-types";
import {
  partitionnerCourses,
  grouperParJourSemaine,
  genererICS,
  genererCSV,
  libelleType,
  type CoursePlanning,
} from "@/lib/planning-course";

const ICONES: Record<TypeTransport, typeof Car> = {
  taxi: Car,
  vsl: Stethoscope,
  ambulance: Cross,
};

const LABEL_MOBILITE: Record<string, string> = {
  autonome: "Autonome",
  aide_marche: "Aide à la marche",
  fauteuil: "Fauteuil roulant",
  brancard: "Allongé / brancard",
};

function IconeType({ type }: { type: string | null }) {
  const Icon = (type && type in ICONES ? ICONES[type as TypeTransport] : Car) as typeof Car;
  return <Icon className="w-4 h-4 text-[#0066CC]" />;
}

function formatDateHeure(iso: string | null): string {
  if (!iso) return "Date non précisée";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date non précisée";
  return d.toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function formatHeure(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

function formatEstimation(c: CoursePlanning): string | null {
  const parts: string[] = [];
  if (typeof c.distance_km === "number" && c.distance_km > 0) {
    parts.push(`${c.distance_km} km`);
  }
  if (typeof c.prix_estime === "number" && c.prix_estime > 0) {
    parts.push(`~${c.prix_estime} €`);
  }
  return parts.length ? parts.join(" · ") : null;
}

function teldigits(tel: string | null): string | null {
  return tel ? tel.replace(/\s/g, "") : null;
}

function telecharger(contenu: string, type: string, nomFichier: string) {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CarteCourse({ c, passee = false }: { c: CoursePlanning; passee?: boolean }) {
  const estimation = formatEstimation(c);
  const tel = teldigits(c.demandeur_telephone);
  return (
    <li
      className={`p-4 rounded-xl border ${
        passee ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
          <IconeType type={c.type_transport} />
          {libelleType(c.type_transport)}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span className="capitalize">{formatDateHeure(c.date_souhaitee)}</span>
        </span>
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-700">
        <MapPin className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
        <span>
          {c.lieu_depart || "Départ non précisé"}
          <ArrowRight className="inline w-3.5 h-3.5 mx-1 text-gray-400" />
          {c.lieu_arrivee || "Arrivée non précisée"}
          {c.aller_retour ? " (aller-retour)" : ""}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        {c.mobilite && (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {LABEL_MOBILITE[c.mobilite] || c.mobilite}
          </span>
        )}
        {estimation && (
          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-medium">
            {estimation}
          </span>
        )}
      </div>

      {(c.demandeur_nom || tel || c.demandeur_email) && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
          <div className="font-medium text-gray-900">{c.demandeur_nom || "Patient"}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {tel && (
              <a
                href={`tel:${tel}`}
                className="inline-flex items-center gap-1 text-[#0066CC] hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {c.demandeur_telephone}
              </a>
            )}
            {c.demandeur_email && (
              <a
                href={`mailto:${c.demandeur_email}`}
                className="inline-flex items-center gap-1 text-gray-600 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                {c.demandeur_email}
              </a>
            )}
          </div>
        </div>
      )}

      {c.precisions && (
        <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-900 whitespace-pre-line">
          {c.precisions}
        </div>
      )}
    </li>
  );
}

const HISTORIQUE_LIMITE = 30;

export default function PlanningCourses({ courses }: { courses: CoursePlanning[] }) {
  const { aVenir, historique } = useMemo(
    () => partitionnerCourses(courses),
    [courses]
  );
  const semaine = useMemo(() => grouperParJourSemaine(aVenir), [aVenir]);
  const historiqueLimite = historique.slice(0, HISTORIQUE_LIMITE);

  const exporterICS = () => {
    telecharger(
      genererICS(aVenir),
      "text/calendar;charset=utf-8",
      "planning-roullepro.ics"
    );
  };

  const exporterCSV = () => {
    telecharger(
      genererCSV(historique),
      "text/csv;charset=utf-8",
      "historique-courses-roullepro.csv"
    );
  };

  return (
    <div className="space-y-10">
      {/* Vue semaine (7 jours glissants) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-[#0066CC]" />
          <h2 className="text-lg font-bold text-gray-900">Ma semaine</h2>
          <span className="text-xs text-gray-500">(7 jours à venir)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {semaine.map((jour) => {
            const label = jour.date.toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              timeZone: "Europe/Paris",
            });
            return (
              <div
                key={jour.cle}
                className="bg-white border border-gray-200 rounded-xl p-3 min-h-[110px]"
              >
                <div className="text-xs font-semibold text-gray-700 capitalize mb-2">
                  {label}
                </div>
                {jour.courses.length === 0 ? (
                  <div className="text-[11px] text-gray-300">—</div>
                ) : (
                  <ul className="space-y-1.5">
                    {jour.courses.map((c) => (
                      <li
                        key={c.dtp_id}
                        className="text-[11px] bg-blue-50 text-blue-900 rounded-lg px-2 py-1"
                      >
                        <div className="font-semibold">{formatHeure(c.date_souhaitee)}</div>
                        <div className="truncate">
                          {c.lieu_arrivee || c.lieu_depart || libelleType(c.type_transport)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses à venir */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#0066CC]" />
            <h2 className="text-lg font-bold text-gray-900">Courses à venir</h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {aVenir.length}
            </span>
          </div>
          <button
            type="button"
            onClick={exporterICS}
            disabled={aVenir.length === 0}
            className="inline-flex items-center gap-1.5 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Exporter (.ics)
          </button>
        </div>
        {aVenir.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-5">
            Aucune course à venir. Les courses que vous acceptez depuis votre tableau
            de bord apparaîtront ici, classées par date.
          </p>
        ) : (
          <ul className="space-y-3">
            {aVenir.map((c) => (
              <CarteCourse key={c.dtp_id} c={c} />
            ))}
          </ul>
        )}
      </section>

      {/* Historique */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Historique</h2>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {historique.length}
            </span>
          </div>
          <button
            type="button"
            onClick={exporterCSV}
            disabled={historique.length === 0}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporter (.csv)
          </button>
        </div>
        {historique.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-5">
            Aucune course passée pour le moment.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {historiqueLimite.map((c) => (
                <CarteCourse key={c.dtp_id} c={c} passee />
              ))}
            </ul>
            {historique.length > HISTORIQUE_LIMITE && (
              <p className="text-xs text-gray-500 mt-3">
                {historiqueLimite.length} courses les plus récentes affichées sur{" "}
                {historique.length}. Exportez le CSV pour l&apos;historique complet.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
