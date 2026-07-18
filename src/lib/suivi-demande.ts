/**
 * Logique pure de l'affichage du suivi de demande cote patient.
 *
 * A partir du statut de la demande et de compteurs anonymes (nombre de pros
 * notifies, nombre de pros ayant vu la demande), on derive un etat lisible.
 * L'identite d'un pro n'est JAMAIS exposee ici, sauf celle du pro AYANT ACCEPTE
 * (nom de l'entreprise + telephone), transmise explicitement par l'appelant.
 *
 * Aucune dependance a Supabase / React : testable unitairement.
 */

export type StatutSuivi =
  | "annulee"
  | "acceptee"
  | "vue"
  | "envoyee"
  | "en_recherche";

export type SuiviAccepteur = {
  nom: string | null;
  telephone: string | null;
};

export type SuiviInput = {
  /** Statut de la demande mere : 'envoyee' | 'traitee' | 'acceptee' | 'annulee' | 'sans_suite'. */
  statut: string | null;
  /** Nombre de professionnels notifies (compteur anonyme). */
  prosNotifies: number | null;
  /** Nombre de professionnels ayant consulte la demande (compteur anonyme). */
  nbVues: number | null;
  /** Identite du pro AYANT ACCEPTE — seule identite autorisee a l'affichage. */
  accepteur?: SuiviAccepteur | null;
};

export type SuiviAffichage = {
  statut: StatutSuivi;
  titre: string;
  description: string;
  /** true tant que la demande n'est pas deja annulee. */
  peutAnnuler: boolean;
  /** Coordonnees du pro accepteur si connues (statut 'acceptee'). */
  accepteur: SuiviAccepteur | null;
};

/** "1 professionnel" / "3 professionnels". */
function pluralPros(n: number): string {
  return `${n} professionnel${n > 1 ? "s" : ""}`;
}

/**
 * Derive l'affichage du suivi patient a partir de l'etat de la demande.
 * L'ordre de priorite : annulee > acceptee > vue > envoyee > en_recherche.
 */
export function construireStatutSuivi(input: SuiviInput): SuiviAffichage {
  const prosNotifies = Math.max(0, input.prosNotifies ?? 0);
  const nbVues = Math.max(0, input.nbVues ?? 0);
  const accepteur = input.accepteur ?? null;

  if (input.statut === "annulee") {
    return {
      statut: "annulee",
      titre: "Demande annulée",
      description:
        "Vous avez annulé cette demande de transport. Aucun professionnel ne vous recontactera à son sujet.",
      peutAnnuler: false,
      accepteur: null,
    };
  }

  if (input.statut === "acceptee" || accepteur) {
    const nom = accepteur?.nom?.trim() || "Un professionnel";
    const tel = accepteur?.telephone?.trim() || null;
    return {
      statut: "acceptee",
      titre: `Demande acceptée par ${nom}`,
      description: tel
        ? `${nom} a accepté votre demande et vous recontactera. Vous pouvez aussi l'appeler au ${tel}.`
        : `${nom} a accepté votre demande et vous recontactera directement.`,
      peutAnnuler: true,
      accepteur: { nom, telephone: tel },
    };
  }

  if (nbVues > 0) {
    return {
      statut: "vue",
      titre: `Vue par ${pluralPros(nbVues)}`,
      description:
        prosNotifies > 0
          ? `Votre demande a été envoyée à ${pluralPros(prosNotifies)} et consultée par ${pluralPros(nbVues)}. Vous serez recontacté dès qu'un professionnel l'accepte.`
          : `Votre demande a été consultée par ${pluralPros(nbVues)}. Vous serez recontacté dès qu'un professionnel l'accepte.`,
      peutAnnuler: true,
      accepteur: null,
    };
  }

  if (prosNotifies > 0) {
    return {
      statut: "envoyee",
      titre: `Envoyée à ${pluralPros(prosNotifies)}`,
      description: `Votre demande a été transmise à ${pluralPros(prosNotifies)} de votre secteur. Vous serez recontacté dès qu'un professionnel l'accepte.`,
      peutAnnuler: true,
      accepteur: null,
    };
  }

  return {
    statut: "en_recherche",
    titre: "Recherche d'un professionnel en cours",
    description:
      "Nous recherchons un professionnel disponible dans votre secteur. Vous serez recontacté rapidement.",
    peutAnnuler: true,
    accepteur: null,
  };
}
