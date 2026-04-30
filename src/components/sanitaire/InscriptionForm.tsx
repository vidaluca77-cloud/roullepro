"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cross,
  Car,
  Users,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  FileText,
  Upload,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { isValidSiretFormat } from "@/lib/siren";

// ─── Schémas Zod par étape ───────────────────────────────────────────────────

const Step1Schema = z.object({
  siret: z
    .string()
    .optional()
    .default("")
    .refine((v) => !v || /^\d{14}$/.test(v.replace(/\s/g, "")), {
      message: "SIRET invalide",
    }),
  raison_sociale: z.string().min(2, "Raison sociale requise"),
  nom_commercial: z.string().optional().default(""),
  categorie: z.enum(["ambulance", "vsl", "taxi_conventionne"], {
    required_error: "Choisissez un type d'activité",
  }),
  services: z.array(z.string()).optional().default([]),
});

const Step2Schema = z.object({
  adresse: z.string().min(3, "Adresse requise"),
  code_postal: z.string().regex(/^\d{5}$/, "Code postal : 5 chiffres"),
  ville: z.string().min(2, "Ville requise"),
  telephone: z.string().min(10, "Téléphone invalide"),
  email: z.string().email("Email invalide"),
  site_web: z.string().optional().default(""),
  description: z.string().max(2000, "Max 2000 caractères").optional().default(""),
  horaires: z.string().optional().default("24/7"),
});

const Step3Schema = z.object({
  prenom: z.string().min(2, "Prénom requis"),
  nom: z.string().min(2, "Nom requis"),
  password: z.string().min(8, "Mot de passe : min 8 caractères"),
  confirm_password: z.string(),
  rgpd_accepted: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter les CGU",
  }),
});

const FullSchema = Step1Schema.merge(Step2Schema)
  .merge(Step3Schema)
  .refine((d) => d.password === d.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof FullSchema>;

// ─── Constantes ──────────────────────────────────────────────────────────────

const SERVICES_OPTIONS = [
  "Urgences",
  "Bariatrique",
  "Pédiatrique",
  "Transport longue distance",
  "Dialyse",
  "Chimio",
  "Rapatriement sanitaire",
];

const HORAIRES_OPTIONS = [
  { value: "24/7", label: "24h/24 — 7j/7" },
  { value: "Lundi-Vendredi 8h-19h", label: "Lun–Ven, 8h–19h" },
  { value: "Sur rendez-vous", label: "Sur rendez-vous" },
  { value: "Autre", label: "Autre (à préciser dans la description)" },
];

const CATEGORY_CARDS = [
  {
    key: "ambulance" as const,
    label: "Ambulance",
    description: "Transport médicalisé, équipage DEA",
    Icon: Cross,
  },
  {
    key: "vsl" as const,
    label: "VSL",
    description: "Véhicule Sanitaire Léger, patient assis stable",
    Icon: Car,
  },
  {
    key: "taxi_conventionne" as const,
    label: "Taxi conventionné",
    description: "Agréé CPAM, tiers payant",
    Icon: Users,
  },
];

// ─── Indicateur de force du mot de passe ─────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Faible", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Moyen", color: "bg-amber-500" };
  return { score, label: "Fort", color: "bg-green-500" };
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function InscriptionForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    message: string;
    claimUrl: string | null;
    ficheUrl: string | null;
    alreadyClaimed: boolean;
    raisonSociale?: string;
    ville?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [siretLoading, setSiretLoading] = useState(false);
  const [siretStatus, setSiretStatus] = useState<"idle" | "found" | "not_found" | "invalid">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const hcaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FullSchema),
    defaultValues: {
      siret: "",
      raison_sociale: "",
      nom_commercial: "",
      services: [],
      adresse: "",
      code_postal: "",
      ville: "",
      telephone: "",
      email: "",
      site_web: "",
      description: "",
      horaires: "24/7",
      prenom: "",
      nom: "",
      password: "",
      confirm_password: "",
      rgpd_accepted: false,
    },
    mode: "onTouched",
  });

  const password = watch("password");
  const description = watch("description");
  const services = watch("services") || [];
  const categorie = watch("categorie");
  const pwStrength = passwordStrength(password || "");

  // ─── hCaptcha init ───────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3) return;
    const sitekey =
      process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "10000000-ffff-ffff-ffff-000000000001";

    const init = () => {
      if (!hcaptchaRef.current || widgetIdRef.current !== null) return;
      if (typeof window !== "undefined" && (window as typeof window & { hcaptcha?: { render: (el: HTMLElement, opts: unknown) => string } }).hcaptcha?.render) {
        const id = (window as typeof window & { hcaptcha: { render: (el: HTMLElement, opts: unknown) => string } }).hcaptcha.render(hcaptchaRef.current!, {
          sitekey,
          size: "invisible",
          callback: (token: string) => setCaptchaToken(token),
          "error-callback": () => setCaptchaToken(""),
          "expired-callback": () => setCaptchaToken(""),
        });
        widgetIdRef.current = id;
      }
    };

    const scriptId = "hcaptcha-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://hcaptcha.com/1/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      init();
    }
  }, [step]);

  // ─── Vérification SIRET ───────────────────────────────────────────────────
  const handleVerifySiret = async () => {
    const siret = getValues("siret")?.replace(/\s/g, "") || "";
    if (!isValidSiretFormat(siret)) {
      setSiretStatus("invalid");
      return;
    }
    setSiretLoading(true);
    setSiretStatus("idle");
    try {
      // Note: /api/siret requiert auth — on appelle l'API gouv directement côté client
      const res = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&mtypes=unite_legale&page=1&per_page=1`
      );
      const data = await res.json() as { results?: Array<{ nom_complet?: string; siege?: { adresse?: string; code_postal?: string; libelle_commune?: string } }> };
      const result = data?.results?.[0];
      if (result) {
        setSiretStatus("found");
        if (result.nom_complet) setValue("raison_sociale", result.nom_complet);
        if (result.siege?.adresse) setValue("adresse", result.siege.adresse);
        if (result.siege?.code_postal) setValue("code_postal", result.siege.code_postal);
        if (result.siege?.libelle_commune) setValue("ville", result.siege.libelle_commune);
      } else {
        setSiretStatus("not_found");
      }
    } catch {
      setSiretStatus("not_found");
    } finally {
      setSiretLoading(false);
    }
  };

  // ─── Navigation étapes ────────────────────────────────────────────────────
  const goNext = async () => {
    setApiError(null);
    let valid = false;
    if (step === 1) {
      valid = await trigger(["raison_sociale", "categorie"]);
    } else if (step === 2) {
      valid = await trigger(["adresse", "code_postal", "ville", "telephone", "email"]);
    }
    if (valid) setStep((s) => s + 1);
  };

  const goPrev = () => {
    setApiError(null);
    setStep((s) => s - 1);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setApiError(null);
    setDuplicateInfo(null);

    // Tenter d'exécuter hCaptcha si pas encore token (non-bloquant)
    let token = captchaToken;
    const w = typeof window !== "undefined"
      ? (window as typeof window & {
          hcaptcha?: {
            execute: (id: string, opts?: { async?: boolean }) => Promise<{ response: string }> | void;
          };
        })
      : null;
    if (!token && w?.hcaptcha && widgetIdRef.current !== null) {
      try {
        // Mode async : execute() retourne une Promise avec le token
        const result = w.hcaptcha.execute(widgetIdRef.current!, { async: true });
        if (result && typeof (result as Promise<{ response: string }>).then === "function") {
          const resolved = await Promise.race([
            result as Promise<{ response: string }>,
            new Promise<{ response: string }>((_, reject) =>
              setTimeout(() => reject(new Error("hcaptcha-timeout")), 8000)
            ),
          ]).catch(() => null);
          if (resolved?.response) token = resolved.response;
        }
      } catch {
        // Non-bloquant — on envoie sans token, le backend laissera passer si HCAPTCHA_SECRET non configuré
      }
    }

    const horairesValue =
      values.horaires === "Autre" ? null : { general: values.horaires || "24/7" };

    try {
      const res = await fetch("/api/sanitaire/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siret: values.siret?.replace(/\s/g, "") || "",
          raison_sociale: values.raison_sociale,
          nom_commercial: values.nom_commercial || "",
          categorie: values.categorie,
          adresse: values.adresse,
          code_postal: values.code_postal,
          ville: values.ville,
          telephone: values.telephone,
          email: values.email,
          site_web: values.site_web || "",
          horaires: horairesValue,
          description: values.description || "",
          services: values.services || [],
          nom: values.nom,
          prenom: values.prenom,
          password: values.password,
          captcha_token: token,
          rgpd_accepted: values.rgpd_accepted,
        }),
      });
      const json = await res.json() as {
        ok?: boolean;
        redirect?: string;
        error?: string;
        duplicate?: boolean;
        already_claimed?: boolean;
        claim_url?: string | null;
        fiche_url?: string | null;
        existing?: { raison_sociale?: string; nom_commercial?: string; ville?: string; claim_status?: string };
      };
      if (!res.ok) {
        if (json.duplicate && json.claim_url) {
          setDuplicateInfo({
            message: json.error || "Cette entreprise est déjà sur RoullePro.",
            claimUrl: json.claim_url,
            ficheUrl: json.fiche_url || null,
            alreadyClaimed: json.already_claimed === true,
            raisonSociale: json.existing?.nom_commercial || json.existing?.raison_sociale,
            ville: json.existing?.ville,
          });
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else {
          setApiError(json.error || "Une erreur est survenue.");
        }
        setLoading(false);
        return;
      }
      if (json.redirect) {
        router.push(json.redirect);
      }
    } catch {
      setApiError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setLoading(false);
    }
  };

  // ─── Composants helpers ───────────────────────────────────────────────────
  const FieldError = ({ name }: { name: string }) => {
    const err = errors[name as keyof typeof errors];
    if (!err?.message) return null;
    return (
      <p className="mt-1 text-sm text-red-600" role="alert" id={`err-${name}`}>
        {String(err.message)}
      </p>
    );
  };

  const inputClass = (name: keyof FormValues) =>
    `w-full px-4 py-3 border rounded-xl text-gray-900 text-sm outline-none transition focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] ${
      errors[name] ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  // ─── Barre de progression ─────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 flex-1">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
              step > n
                ? "bg-[#0066CC] text-white"
                : step === n
                ? "bg-[#0066CC] text-white ring-4 ring-[#0066CC]/20"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
          </div>
          {n < 3 && (
            <div
              className={`h-0.5 flex-1 transition-colors ${
                step > n ? "bg-[#0066CC]" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ─── ÉTAPE 1 ──────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Identité de l'entreprise</h2>
        <p className="text-sm text-gray-500">Étape 1 sur 3 · Informations légales et activité</p>
      </div>

      {/* SIRET */}
      <div>
        <label htmlFor="siret" className={labelClass}>
          Numéro SIRET{" "}
          <span className="text-gray-400 font-normal">(facultatif)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="siret"
            {...register("siret")}
            placeholder="Ex : 12345678901234"
            maxLength={14}
            className={inputClass("siret")}
            aria-invalid={!!errors.siret}
            aria-describedby={errors.siret ? "err-siret" : undefined}
          />
          <button
            type="button"
            onClick={handleVerifySiret}
            disabled={siretLoading}
            className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
          >
            {siretLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Vérifier
          </button>
        </div>
        {siretStatus === "found" && (
          <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Entreprise trouvée — champs pré-remplis.
          </p>
        )}
        {siretStatus === "not_found" && (
          <p className="mt-1.5 text-sm text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> SIRET non trouvé — remplissez manuellement.
          </p>
        )}
        {siretStatus === "invalid" && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Format SIRET invalide (14 chiffres).
          </p>
        )}
        <FieldError name="siret" />
        <p className="mt-1.5 text-xs text-gray-400">
          Pas de SIRET ? Passez à l'étape suivante — un admin validera manuellement.
        </p>
      </div>

      {/* Raison sociale */}
      <div>
        <label htmlFor="raison_sociale" className={labelClass}>
          Raison sociale <span className="text-red-500">*</span>
        </label>
        <input
          id="raison_sociale"
          {...register("raison_sociale")}
          placeholder="Ex : Ambulances Dupont SARL"
          className={inputClass("raison_sociale")}
          aria-invalid={!!errors.raison_sociale}
          aria-describedby={errors.raison_sociale ? "err-raison_sociale" : undefined}
        />
        <FieldError name="raison_sociale" />
      </div>

      {/* Nom commercial */}
      <div>
        <label htmlFor="nom_commercial" className={labelClass}>
          Nom commercial{" "}
          <span className="text-gray-400 font-normal">(si différent)</span>
        </label>
        <input
          id="nom_commercial"
          {...register("nom_commercial")}
          placeholder="Ex : Ambulances Dupont"
          className={inputClass("nom_commercial")}
        />
      </div>

      {/* Catégorie */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Type d'activité <span className="text-red-500">*</span>
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {CATEGORY_CARDS.map(({ key, label, description, Icon }) => (
            <label
              key={key}
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition ${
                categorie === key
                  ? "border-[#0066CC] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value={key}
                {...register("categorie")}
                className="sr-only"
              />
              <Icon
                className={`w-8 h-8 ${
                  categorie === key ? "text-[#0066CC]" : "text-gray-400"
                }`}
              />
              <div className="font-semibold text-sm text-gray-900">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </label>
          ))}
        </div>
        <FieldError name="categorie" />
      </div>

      {/* Services */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Services proposés{" "}
          <span className="text-gray-400 font-normal">(multi-sélection)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SERVICES_OPTIONS.map((s) => {
            const checked = services.includes(s);
            return (
              <label
                key={s}
                className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition ${
                  checked
                    ? "border-[#0066CC] bg-blue-50 text-[#0066CC]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  value={s}
                  checked={checked}
                  onChange={(e) => {
                    const cur = getValues("services") || [];
                    if (e.target.checked) {
                      setValue("services", [...cur, s]);
                    } else {
                      setValue(
                        "services",
                        cur.filter((x) => x !== s)
                      );
                    }
                  }}
                  className="sr-only"
                />
                {s}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── ÉTAPE 2 ──────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Coordonnées & activité</h2>
        <p className="text-sm text-gray-500">Étape 2 sur 3 · Adresse et contact professionnel</p>
      </div>

      <div>
        <label htmlFor="adresse" className={labelClass}>
          Adresse du siège <span className="text-red-500">*</span>
        </label>
        <input
          id="adresse"
          {...register("adresse")}
          placeholder="Ex : 12 rue de la Paix"
          className={inputClass("adresse")}
          aria-invalid={!!errors.adresse}
          aria-describedby={errors.adresse ? "err-adresse" : undefined}
        />
        <FieldError name="adresse" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="code_postal" className={labelClass}>
            Code postal <span className="text-red-500">*</span>
          </label>
          <input
            id="code_postal"
            {...register("code_postal")}
            placeholder="Ex : 75001"
            maxLength={5}
            className={inputClass("code_postal")}
            aria-invalid={!!errors.code_postal}
            aria-describedby={errors.code_postal ? "err-code_postal" : undefined}
          />
          <FieldError name="code_postal" />
        </div>
        <div>
          <label htmlFor="ville" className={labelClass}>
            Ville <span className="text-red-500">*</span>
          </label>
          <input
            id="ville"
            {...register("ville")}
            placeholder="Ex : Paris"
            className={inputClass("ville")}
            aria-invalid={!!errors.ville}
            aria-describedby={errors.ville ? "err-ville" : undefined}
          />
          <FieldError name="ville" />
        </div>
      </div>

      <div>
        <label htmlFor="telephone" className={labelClass}>
          Téléphone professionnel <span className="text-red-500">*</span>
        </label>
        <input
          id="telephone"
          type="tel"
          {...register("telephone")}
          placeholder="Ex : 06 12 34 56 78"
          className={inputClass("telephone")}
          aria-invalid={!!errors.telephone}
          aria-describedby={errors.telephone ? "err-telephone" : undefined}
        />
        <FieldError name="telephone" />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email professionnel <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Ex : contact@ambulances-dupont.fr"
          className={inputClass("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-email" : undefined}
        />
        <FieldError name="email" />
      </div>

      <div>
        <label htmlFor="site_web" className={labelClass}>
          Site web <span className="text-gray-400 font-normal">(facultatif)</span>
        </label>
        <input
          id="site_web"
          type="url"
          {...register("site_web")}
          placeholder="Ex : https://ambulances-dupont.fr"
          className={inputClass("site_web")}
        />
        <FieldError name="site_web" />
      </div>

      <div>
        <label htmlFor="horaires" className={labelClass}>
          Horaires
        </label>
        <select
          id="horaires"
          {...register("horaires")}
          className={inputClass("horaires")}
        >
          {HORAIRES_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description{" "}
          <span className="text-gray-400 font-normal">(facultatif, max 2000 caractères)</span>
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          placeholder="Présentez votre entreprise, vos spécialités, votre zone d'intervention…"
          className={`${inputClass("description")} resize-none`}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "err-description" : undefined}
        />
        <div className="flex justify-between mt-1">
          <FieldError name="description" />
          <span className="text-xs text-gray-400 ml-auto">
            {(description || "").length} / 2000
          </span>
        </div>
      </div>
    </div>
  );

  // ─── ÉTAPE 3 ──────────────────────────────────────────────────────────────
  const renderStep3 = () => {
    const values = getValues();
    const nomAffiche = values.nom_commercial || values.raison_sociale;
    const catLabel =
      CATEGORY_CARDS.find((c) => c.key === values.categorie)?.label || values.categorie;

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Création de compte gérant</h2>
          <p className="text-sm text-gray-500">Étape 3 sur 3 · Accès à votre espace pro</p>
        </div>

        {/* Résumé */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
          <p className="font-semibold text-[#0066CC] mb-1">Résumé de votre inscription</p>
          <ul className="text-gray-700 space-y-0.5">
            <li>
              <span className="text-gray-500">Entreprise :</span> {nomAffiche}
            </li>
            <li>
              <span className="text-gray-500">Catégorie :</span> {catLabel}
            </li>
            <li>
              <span className="text-gray-500">Ville :</span> {values.ville} ({values.code_postal})
            </li>
            <li>
              <span className="text-gray-500">Email :</span> {values.email}
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="prenom" className={labelClass}>
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              id="prenom"
              {...register("prenom")}
              placeholder="Prénom"
              className={inputClass("prenom")}
              aria-invalid={!!errors.prenom}
              aria-describedby={errors.prenom ? "err-prenom" : undefined}
            />
            <FieldError name="prenom" />
          </div>
          <div>
            <label htmlFor="nom" className={labelClass}>
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="nom"
              {...register("nom")}
              placeholder="Nom"
              className={inputClass("nom")}
              aria-invalid={!!errors.nom}
              aria-describedby={errors.nom ? "err-nom" : undefined}
            />
            <FieldError name="nom" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Min 8 caractères"
              className={`${inputClass("password")} pr-10`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "err-password" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pwStrength.color}`}
                  style={{ width: `${(pwStrength.score / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-gray-500">
                Force : <span className="font-medium">{pwStrength.label}</span>
              </p>
            </div>
          )}
          <FieldError name="password" />
        </div>

        <div>
          <label htmlFor="confirm_password" className={labelClass}>
            Confirmer le mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            id="confirm_password"
            type="password"
            {...register("confirm_password")}
            placeholder="Retapez votre mot de passe"
            className={inputClass("confirm_password")}
            aria-invalid={!!errors.confirm_password}
            aria-describedby={errors.confirm_password ? "err-confirm_password" : undefined}
          />
          <FieldError name="confirm_password" />
        </div>

        {/* CGU */}
        <div className="flex items-start gap-3">
          <input
            id="rgpd_accepted"
            type="checkbox"
            {...register("rgpd_accepted")}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
            aria-invalid={!!errors.rgpd_accepted}
            aria-describedby={errors.rgpd_accepted ? "err-rgpd_accepted" : undefined}
          />
          <label htmlFor="rgpd_accepted" className="text-sm text-gray-700">
            J'accepte les{" "}
            <Link href="/cgu" target="_blank" className="text-[#0066CC] underline">
              Conditions Générales d'Utilisation
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" target="_blank" className="text-[#0066CC] underline">
              politique de confidentialité
            </Link>{" "}
            de RoullePro. <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.rgpd_accepted && (
          <p className="text-sm text-red-600" role="alert" id="err-rgpd_accepted">
            {String(errors.rgpd_accepted.message)}
          </p>
        )}

        {/* hCaptcha invisible */}
        <div ref={hcaptchaRef} />
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepBar />

      {apiError && (
        <div
          className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{apiError}</p>
        </div>
      )}

      {duplicateInfo && (
        <div
          className={`mb-6 rounded-2xl p-5 border ${
            duplicateInfo.alreadyClaimed
              ? "bg-amber-50 border-amber-200"
              : "bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                duplicateInfo.alreadyClaimed ? "bg-amber-100" : "bg-blue-100"
              }`}
            >
              {duplicateInfo.alreadyClaimed ? (
                <AlertCircle className="w-5 h-5 text-amber-700" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#0066CC]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-bold text-base mb-1 ${
                  duplicateInfo.alreadyClaimed ? "text-amber-900" : "text-gray-900"
                }`}
              >
                {duplicateInfo.alreadyClaimed
                  ? "Cette fiche est déjà réclamée"
                  : "Votre entreprise est déjà sur RoullePro"}
              </h3>
              <p className="text-sm text-gray-700 mb-3">{duplicateInfo.message}</p>
              {duplicateInfo.raisonSociale && (
                <div className="bg-white/70 rounded-lg px-3 py-2 mb-3 text-sm text-gray-700">
                  <span className="text-gray-500">Fiche :</span>{" "}
                  <span className="font-semibold">{duplicateInfo.raisonSociale}</span>
                  {duplicateInfo.ville && (
                    <span className="text-gray-500"> — {duplicateInfo.ville}</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {!duplicateInfo.alreadyClaimed && duplicateInfo.claimUrl && (
                  <Link
                    href={duplicateInfo.claimUrl}
                    className="inline-flex items-center gap-1.5 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
                  >
                    Réclamer ma fiche <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {duplicateInfo.ficheUrl && (
                  <Link
                    href={duplicateInfo.ficheUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm transition"
                  >
                    Voir la fiche <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {duplicateInfo.alreadyClaimed && (
                  <a
                    href="mailto:contact@roullepro.com"
                    className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
                  >
                    Contacter le support
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        {step > 1 ? (
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Création en cours…
              </>
            ) : (
              "Créer ma fiche"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
