import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

export type ContratDepotData = {
  numero_contrat: string;
  date_signature: string; // ISO
  // Mandant (vendeur)
  vendeur_nom: string;
  vendeur_email: string;
  vendeur_adresse?: string | null;
  vendeur_telephone?: string | null;
  vendeur_siret?: string | null;
  // Dépositaire (garage)
  garage_raison_sociale: string;
  garage_siret: string;
  garage_adresse: string;
  garage_code_postal: string;
  garage_ville: string;
  garage_contact_nom?: string | null;
  // Véhicule
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_immatriculation?: string | null;
  vehicule_vin?: string | null;
  vehicule_annee?: number | null;
  vehicule_kilometrage?: number | null;
  vehicule_prix_demande: number; // euros
  // Commissions
  commission_roullepro_pct: number; // 4
  commission_garage_pct: number; // 7
  forfait_preparation: number; // 250
  part_vendeur_pct: number; // 88
  // Récupération
  recuperation_domicile: boolean;
  frais_recuperation?: number | null;
  adresse_recuperation?: string | null;
  // Durée
  duree_jours: number; // 90
};

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type Ctx = {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
};

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN) newPage(ctx);
}

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawText(ctx: Ctx, text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number } = {}) {
  const size = opts.size ?? 10;
  const font = opts.bold ? ctx.fontBold : ctx.font;
  const color = opts.color ?? [0, 0, 0];
  const indent = opts.indent ?? 0;
  const lines = wrapLines(text, font, size, CONTENT_WIDTH - indent);
  const lineHeight = size * 1.4;
  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line, {
      x: MARGIN + indent,
      y: ctx.y - size,
      size,
      font,
      color: rgb(color[0], color[1], color[2]),
    });
    ctx.y -= lineHeight;
  }
}

function drawTitle(ctx: Ctx, text: string, size = 14) {
  ctx.y -= 8;
  drawText(ctx, text, { size, bold: true });
  ctx.y -= 4;
}

function drawSeparator(ctx: Ctx) {
  ensureSpace(ctx, 16);
  ctx.y -= 8;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  ctx.y -= 8;
}

function formatEUR(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export async function generateContratDepotPDF(data: ContratDepotData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { doc, page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), font, fontBold, y: PAGE_HEIGHT - MARGIN };

  // Header
  drawText(ctx, "RoullePro", { size: 20, bold: true, color: [0.05, 0.2, 0.5] });
  drawText(ctx, "Plateforme de depot-vente de vehicules professionnels", { size: 9, color: [0.4, 0.4, 0.4] });
  ctx.y -= 6;
  drawText(ctx, `Contrat N° ${data.numero_contrat}`, { size: 10, bold: true });
  drawText(ctx, `Date : ${formatDate(data.date_signature)}`, { size: 10 });
  drawSeparator(ctx);

  // Titre
  drawTitle(ctx, "CONTRAT DE MANDAT DE DEPOT-VENTE", 16);
  drawText(ctx, "Conclu entre les parties designees ci-dessous, le present contrat regit les conditions du depot en vue de la vente d'un vehicule professionnel via la plateforme RoullePro.", { size: 10 });
  drawSeparator(ctx);

  // Parties
  drawTitle(ctx, "IDENTIFICATION DES PARTIES");

  drawText(ctx, "LE MANDANT (Vendeur)", { bold: true, size: 11 });
  drawText(ctx, `Nom / Raison sociale : ${data.vendeur_nom}`);
  drawText(ctx, `Email : ${data.vendeur_email}`);
  if (data.vendeur_telephone) drawText(ctx, `Telephone : ${data.vendeur_telephone}`);
  if (data.vendeur_adresse) drawText(ctx, `Adresse : ${data.vendeur_adresse}`);
  if (data.vendeur_siret) drawText(ctx, `SIRET : ${data.vendeur_siret}`);
  ctx.y -= 8;

  drawText(ctx, "LE DEPOSITAIRE (Garage partenaire)", { bold: true, size: 11 });
  drawText(ctx, `Raison sociale : ${data.garage_raison_sociale}`);
  drawText(ctx, `SIRET : ${data.garage_siret}`);
  drawText(ctx, `Adresse : ${data.garage_adresse}, ${data.garage_code_postal} ${data.garage_ville}`);
  if (data.garage_contact_nom) drawText(ctx, `Representant : ${data.garage_contact_nom}`);
  ctx.y -= 8;

  drawText(ctx, "LA PLATEFORME", { bold: true, size: 11 });
  drawText(ctx, "RoullePro - Intermediaire de mise en relation");
  drawText(ctx, "Site : https://roullepro.com");
  drawSeparator(ctx);

  // Véhicule
  drawTitle(ctx, "ARTICLE 1 - DESIGNATION DU VEHICULE");
  drawText(ctx, `Marque / Modele : ${data.vehicule_marque} ${data.vehicule_modele}`);
  if (data.vehicule_annee) drawText(ctx, `Annee : ${data.vehicule_annee}`);
  if (data.vehicule_kilometrage) drawText(ctx, `Kilometrage : ${data.vehicule_kilometrage.toLocaleString("fr-FR")} km`);
  if (data.vehicule_immatriculation) drawText(ctx, `Immatriculation : ${data.vehicule_immatriculation}`);
  if (data.vehicule_vin) drawText(ctx, `Numero VIN : ${data.vehicule_vin}`);
  drawText(ctx, `Prix de vente demande : ${formatEUR(data.vehicule_prix_demande)}`, { bold: true });
  drawSeparator(ctx);

  // Durée
  drawTitle(ctx, "ARTICLE 2 - DUREE DU MANDAT");
  drawText(ctx, `Le present mandat est conclu pour une duree de ${data.duree_jours} jours calendaires a compter de la date de depot effectif du vehicule chez le Depositaire.`);
  drawText(ctx, "A l'issue de cette periode, si le vehicule n'a pas ete vendu, le Mandant recupere son vehicule sans frais ni penalite, dans un delai de 10 jours ouvres. Un renouvellement tacite de 30 jours peut etre propose au Mandant.");
  drawSeparator(ctx);

  // Récupération domicile
  if (data.recuperation_domicile) {
    drawTitle(ctx, "ARTICLE 3 - RECUPERATION A DOMICILE");
    drawText(ctx, `Le Mandant a opte pour la recuperation du vehicule a domicile par le Depositaire.`);
    if (data.adresse_recuperation) drawText(ctx, `Adresse de recuperation : ${data.adresse_recuperation}`);
    drawText(ctx, `Frais forfaitaires : ${formatEUR(data.frais_recuperation ?? 79)} (rayon 50 km autour du garage).`);
    drawText(ctx, "Ces frais sont deduits du produit de la vente. En cas de vehicule non vendu, les frais restent a la charge du Mandant.");
    drawSeparator(ctx);
  }

  // Commissions
  drawTitle(ctx, `ARTICLE ${data.recuperation_domicile ? 4 : 3} - REPARTITION DU PRODUIT DE LA VENTE`);
  drawText(ctx, "A la vente effective du vehicule, le prix paye par l'acquereur est reparti comme suit :");
  ctx.y -= 4;
  drawText(ctx, `- ${data.part_vendeur_pct}% : reverses au Mandant (Vendeur)`, { indent: 20 });
  drawText(ctx, `- ${data.commission_garage_pct}% + ${formatEUR(data.forfait_preparation)} de forfait preparation : reverses au Depositaire`, { indent: 20 });
  drawText(ctx, `- ${data.commission_roullepro_pct}% : reverses a la plateforme RoullePro`, { indent: 20 });
  ctx.y -= 4;
  drawText(ctx, "Les frais de traitement Stripe (~1%) sont supportes par RoullePro. Les reversements sont effectues sous 7 jours ouvres apres encaissement definitif et remise du vehicule a l'acquereur.");
  drawSeparator(ctx);

  // Obligations
  drawTitle(ctx, `ARTICLE ${data.recuperation_domicile ? 5 : 4} - OBLIGATIONS DES PARTIES`);
  drawText(ctx, "Le Mandant s'engage a :", { bold: true });
  drawText(ctx, "- Fournir un vehicule conforme a la description declaree, carte grise et controle technique a jour.", { indent: 15 });
  drawText(ctx, "- Ne pas ceder le vehicule en dehors du present mandat pendant sa duree.", { indent: 15 });
  drawText(ctx, "- Autoriser le Depositaire a presenter, faire essayer et livrer le vehicule.", { indent: 15 });
  ctx.y -= 4;
  drawText(ctx, "Le Depositaire s'engage a :", { bold: true });
  drawText(ctx, "- Assurer la conservation du vehicule en lieu sur et couvert.", { indent: 15 });
  drawText(ctx, "- Effectuer la preparation esthetique et mecanique convenue (forfait).", { indent: 15 });
  drawText(ctx, "- Realiser les essais et demonstrations avec les acquereurs potentiels.", { indent: 15 });
  drawText(ctx, "- Restituer le vehicule au Mandant en cas de non-vente dans les delais.", { indent: 15 });
  ctx.y -= 4;
  drawText(ctx, "RoullePro s'engage a :", { bold: true });
  drawText(ctx, "- Mettre en relation le Mandant et les acquereurs via sa plateforme.", { indent: 15 });
  drawText(ctx, "- Operer le paiement securise via Stripe et reverser les parts convenues.", { indent: 15 });
  drawText(ctx, "- Conserver une trace numerique de toutes les etapes du depot.", { indent: 15 });
  drawSeparator(ctx);

  // Assurance
  drawTitle(ctx, `ARTICLE ${data.recuperation_domicile ? 6 : 5} - ASSURANCE ET RESPONSABILITE`);
  drawText(ctx, "Le vehicule reste assure par le Mandant jusqu'a son depot effectif chez le Depositaire. Apres depot, le vehicule est couvert par l'assurance professionnelle (garage) du Depositaire pour les risques de stationnement, d'incendie et de vol.");
  drawText(ctx, "Les essais routiers effectues par les acquereurs potentiels sont couverts par l'assurance du Depositaire.");
  drawSeparator(ctx);

  // Litiges
  drawTitle(ctx, `ARTICLE ${data.recuperation_domicile ? 7 : 6} - LITIGES ET MEDIATION`);
  drawText(ctx, "En cas de differend, les parties s'engagent a tenter une resolution amiable via la plateforme RoullePro avant toute procedure. A defaut, les tribunaux francais sont seuls competents, le droit francais etant applicable.");
  drawSeparator(ctx);

  // Signatures
  ensureSpace(ctx, 120);
  drawTitle(ctx, "SIGNATURES");
  drawText(ctx, `Fait a ${data.garage_ville}, le ${formatDate(data.date_signature)}.`);
  ctx.y -= 20;

  // Blocs de signature
  const colWidth = (CONTENT_WIDTH - 20) / 3;
  const sigY = ctx.y;
  ensureSpace(ctx, 80);

  const drawSigBloc = (x: number, label: string) => {
    ctx.page.drawText(label, { x, y: sigY, size: 9, font: ctx.fontBold });
    ctx.page.drawRectangle({
      x,
      y: sigY - 65,
      width: colWidth,
      height: 55,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
    });
    ctx.page.drawText("Signature / Cachet", { x: x + 5, y: sigY - 20, size: 8, font: ctx.font, color: rgb(0.5, 0.5, 0.5) });
  };

  drawSigBloc(MARGIN, "Le Mandant");
  drawSigBloc(MARGIN + colWidth + 10, "Le Depositaire");
  drawSigBloc(MARGIN + (colWidth + 10) * 2, "RoullePro");

  ctx.y = sigY - 80;

  // Footer
  ctx.y -= 20;
  drawText(ctx, "Document genere automatiquement par RoullePro. Version 1.0. Contrat a faire relire par un professionnel du droit.", { size: 7, color: [0.5, 0.5, 0.5] });
  drawText(ctx, `Contrat N° ${data.numero_contrat} - https://roullepro.com`, { size: 7, color: [0.5, 0.5, 0.5] });

  return await doc.save();
}
