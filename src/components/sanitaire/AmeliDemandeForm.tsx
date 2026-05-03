'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

type ProofType =
  | 'attestation_ameli'
  | 'contrat_conventionnement'
  | 'capture_compte_ameli'
  | 'autre';

interface Props {
  proId: string;
  defaultSiret: string;
  existingRequestId: string | null;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function AmeliDemandeForm({ proId, defaultSiret, existingRequestId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [siret, setSiret] = useState(defaultSiret);
  const [numeroAm, setNumeroAm] = useState('');
  const [dateConvention, setDateConvention] = useState('');
  const [proofType, setProofType] = useState<ProofType>('attestation_ameli');
  const [file, setFile] = useState<File | null>(null);
  const [declarationOk, setDeclarationOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] || null;
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('Le fichier dépasse 5 Mo. Merci de le compresser.');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (!ALLOWED_MIMES.includes(f.type)) {
      setError('Format non accepté. Utilisez PDF, JPG ou PNG.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!siret.trim() || siret.replace(/\s/g, '').length !== 14) {
      setError('Le SIRET doit contenir 14 chiffres.');
      return;
    }
    if (!file) {
      setError('Merci de joindre une preuve.');
      return;
    }
    if (!declarationOk) {
      setError('Vous devez cocher la déclaration sur l\'honneur.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Récupérer user pour le path storage
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Session expirée. Reconnectez-vous.');
        setSubmitting(false);
        return;
      }

      // 2. Upload fichier dans bucket privé ameli-proofs
      // Path: <user_id>/<timestamp>_<filename>
      const ext = file.name.split('.').pop() || 'bin';
      const safeName = `${Date.now()}.${ext}`;
      const path = `${user.id}/${safeName}`;

      const { error: upErr } = await supabase.storage
        .from('ameli-proofs')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (upErr) {
        setError(`Échec de l'envoi du fichier : ${upErr.message}`);
        setSubmitting(false);
        return;
      }

      // 3. Appeler l'API submit
      const res = await fetch('/api/pro/ameli-demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pro_id: proId,
          siret: siret.replace(/\s/g, ''),
          numero_am: numeroAm.trim() || null,
          date_convention: dateConvention || null,
          proof_type: proofType,
          proof_file_url: path,
          proof_file_size_bytes: file.size,
          proof_mime: file.type,
          declaration_honneur: true,
          existing_request_id: existingRequestId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Si erreur API, supprimer le fichier orphelin
        await supabase.storage.from('ameli-proofs').remove([path]).catch(() => undefined);
        setError(data.error || 'Erreur lors de la soumission.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => router.push('/transport-medical/pro/dashboard'), 2500);
    } catch (err) {
      setError((err as Error).message || 'Erreur inattendue.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée</h2>
        <p className="text-gray-600">
          Votre demande a bien été reçue. Vous recevrez un email sous 5 jours ouvrés.
        </p>
        <p className="text-sm text-gray-400 mt-3">Redirection en cours…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SIRET <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          required
          maxLength={17}
          placeholder="123 456 789 00012"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro AM (Assurance Maladie)
        </label>
        <input
          type="text"
          value={numeroAm}
          onChange={(e) => setNumeroAm(e.target.value)}
          placeholder="Optionnel"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date du conventionnement
        </label>
        <input
          type="date"
          value={dateConvention}
          onChange={(e) => setDateConvention(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de preuve <span className="text-red-500">*</span>
        </label>
        <select
          value={proofType}
          onChange={(e) => setProofType(e.target.value as ProofType)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        >
          <option value="attestation_ameli">Attestation Ameli</option>
          <option value="contrat_conventionnement">Contrat de conventionnement</option>
          <option value="capture_compte_ameli">Capture du compte ameli.fr</option>
          <option value="autre">Autre justificatif</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Justificatif (PDF, JPG ou PNG, 5 Mo max) <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={onFileChange}
          required
          className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#0066CC] hover:file:bg-blue-100"
        />
        {file && (
          <p className="text-xs text-gray-500 mt-1">
            {file.name} — {(file.size / 1024).toFixed(0)} ko
          </p>
        )}
      </div>

      {/* === MENTION LÉGALE === */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[13px] leading-relaxed text-gray-700">
        <div className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">
          Engagement et information légale
        </div>
        <p className="mb-2">
          En soumettant cette demande, je reconnais et accepte ce qui suit :
        </p>

        <p className="font-medium text-gray-900 mt-3 mb-1">1. Véracité des informations</p>
        <p className="mb-2">
          Je certifie que les informations renseignées dans ce formulaire sont exactes et que
          la société identifiée par le SIRET indiqué est, à la date de cette demande,
          conventionnée par l&apos;Assurance Maladie pour le transport sanitaire. Je certifie
          être habilité(e) à représenter cette société dans le cadre de cette démarche.
        </p>

        <p className="font-medium text-gray-900 mt-3 mb-1">2. Vérification par RoullePro</p>
        <p className="mb-2">
          RoullePro examinera ma demande dans un délai indicatif de 5 jours ouvrés. RoullePro
          se réserve le droit de demander des justificatifs complémentaires, de refuser la
          demande, ou de retirer ultérieurement le badge en cas de doute sur la véracité des
          informations, de cessation du conventionnement, ou à la demande de l&apos;Assurance
          Maladie ou de toute autorité compétente.
        </p>

        <p className="font-medium text-gray-900 mt-3 mb-1">3. Conservation des preuves</p>
        <p className="mb-2">
          Le ou les documents transmis seront conservés de manière confidentielle, uniquement
          à des fins de justification de l&apos;attribution du badge, pour une durée maximale
          de 3 ans après l&apos;examen de la demande, conformément aux obligations légales de
          RoullePro. Ils ne seront ni publiés, ni communiqués à des tiers, sauf obligation
          légale ou demande d&apos;une autorité compétente.
        </p>

        <p className="font-medium text-gray-900 mt-3 mb-1">4. Engagement post-attribution</p>
        <p className="mb-2">
          En cas d&apos;attribution du badge, je m&apos;engage à informer RoullePro sans délai
          en cas de cessation, suspension ou modification du conventionnement de la société
          auprès de l&apos;Assurance Maladie, par email à{' '}
          <a href="mailto:contact@roullepro.com" className="text-[#0066CC] underline">
            contact@roullepro.com
          </a>
          .
        </p>

        <p className="font-medium text-gray-900 mt-3 mb-1">5. Responsabilité</p>
        <p className="mb-2">
          Toute déclaration inexacte ou frauduleuse engage la responsabilité personnelle du
          déclarant. RoullePro se réserve le droit de retirer le badge, de suspendre la fiche,
          et le cas échéant de signaler les faits aux autorités compétentes.
        </p>

        <p className="font-medium text-gray-900 mt-3 mb-1">6. Données personnelles (RGPD)</p>
        <p>
          Les données collectées dans ce formulaire (SIRET, numéro AM, date de convention,
          fichier de preuve, identité du demandeur) sont traitées par RoullePro pour
          l&apos;unique finalité de vérification du conventionnement Ameli. Conformément au
          RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
          de vos données en écrivant à{' '}
          <a href="mailto:contact@roullepro.com" className="text-[#0066CC] underline">
            contact@roullepro.com
          </a>
          . Pour plus de détails :{' '}
          <a href="/rgpd" className="text-[#0066CC] underline">
            https://roullepro.com/rgpd
          </a>
        </p>
      </div>

      {/* Séparation */}
      <hr className="border-gray-200" />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={declarationOk}
          onChange={(e) => setDeclarationOk(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#0066CC]"
        />
        <span className="text-sm text-gray-800">
          Je déclare sur l&apos;honneur que les informations fournies sont exactes et
          j&apos;accepte les conditions ci-dessus.
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !declarationOk}
        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg font-medium transition"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Envoyer ma demande
          </>
        )}
      </button>
    </form>
  );
}
