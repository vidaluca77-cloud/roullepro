/**
 * Generation du rapport conformite PDF (Phase 4).
 * Utilise pdf-lib (deja installe pour les contrats depot-vente).
 * Compatible Node.js runtime uniquement (pas Edge).
 */

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

export type ConformiteReportData = {
  pro: {
    raison_sociale: string;
    nom_commercial: string | null;
    ville: string | null;
    departement: string | null;
    categorie: string | null;
  };
  profile: {
    metiers: string[];
    activites: string[];
    region_code: string | null;
    fleet_size: number | null;
    sefi_certified: boolean | null;
  };
  score: number;
  alerts: {
    title_short: string;
    urgency: string;
    applicable_from: string | null;
    deadline: string | null;
    checked: number;
    total: number;
  }[];
  deadlines: {
    label: string;
    due_date: string;
    alert_title: string;
    kind: string;
    status: "past" | "soon" | "future";
  }[];
  generatedAt: Date;
};

const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN_X = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 60;

const COLOR_TEXT = rgb(0.05, 0.1, 0.16);
const COLOR_MUTED = rgb(0.35, 0.4, 0.45);
const COLOR_PRIMARY = rgb(0.11, 0.31, 0.84);
const COLOR_ACCENT = rgb(0.06, 0.41, 0.27);
const COLOR_DIVIDER = rgb(0.85, 0.88, 0.92);
const COLOR_GOOD = rgb(0.13, 0.55, 0.32);
const COLOR_WARN = rgb(0.85, 0.55, 0.13);
const COLOR_BAD = rgb(0.82, 0.18, 0.18);

const URGENCY_LABEL: Record<string, string> = {
  critical: "Critique",
  high: "Urgence elevee",
  medium: "Importance moyenne",
  info: "Information",
  low: "Faible",
};

const KIND_LABEL: Record<string, string> = {
  echeance: "Echeance",
  application: "Application",
  transition: "Transition",
  rappel: "Rappel",
};

function stripAccents(s: string): string {
  // pdf-lib StandardFonts (Helvetica) ne supporte que Latin-1 ; on retire les
  // caracteres hors-ASCII pour eviter les WinAnsi encoding errors.
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xff]/g, "?");
}

function formatFr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type PageCtx = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  font: PDFFont;
  fontBold: PDFFont;
};

function newPage(ctx: PageCtx) {
  ctx.page = ctx.doc.addPage([A4_W, A4_H]);
  ctx.y = A4_H - MARGIN_TOP;
}

function ensureSpace(ctx: PageCtx, needed: number) {
  if (ctx.y - needed < MARGIN_BOTTOM) newPage(ctx);
}

function drawText(
  ctx: PageCtx,
  text: string,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; x?: number } = {}
) {
  const size = opts.size ?? 11;
  const font = opts.bold ? ctx.fontBold : ctx.font;
  const color = opts.color ?? COLOR_TEXT;
  const x = opts.x ?? MARGIN_X;
  ctx.page.drawText(stripAccents(text), { x, y: ctx.y, size, font, color });
}

function moveY(ctx: PageCtx, dy: number) {
  ctx.y -= dy;
}

function wrapLines(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = stripAccents(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(
  ctx: PageCtx,
  text: string,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; maxWidth?: number } = {}
) {
  const size = opts.size ?? 11;
  const font = opts.bold ? ctx.fontBold : ctx.font;
  const color = opts.color ?? COLOR_TEXT;
  const maxWidth = opts.maxWidth ?? A4_W - 2 * MARGIN_X;
  const lines = wrapLines(font, text, size, maxWidth);
  for (const line of lines) {
    ensureSpace(ctx, size + 4);
    ctx.page.drawText(line, {
      x: MARGIN_X,
      y: ctx.y,
      size,
      font,
      color,
    });
    moveY(ctx, size + 4);
  }
}

function drawDivider(ctx: PageCtx) {
  ensureSpace(ctx, 8);
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y },
    end: { x: A4_W - MARGIN_X, y: ctx.y },
    thickness: 0.5,
    color: COLOR_DIVIDER,
  });
  moveY(ctx, 10);
}

function scoreColor(score: number) {
  if (score >= 80) return COLOR_GOOD;
  if (score >= 50) return COLOR_WARN;
  return COLOR_BAD;
}

function scoreLabel(score: number) {
  if (score >= 80) return "Bon";
  if (score >= 50) return "A ameliorer";
  return "Attention";
}

const METIER_LABELS: Record<string, string> = {
  ambulance: "Ambulance",
  vsl: "VSL",
  taxi_conventionne: "Taxi conventionne",
};

const ACTIVITE_LABELS: Record<string, string> = {
  transport_assis: "Transport assis",
  transport_allonge: "Transport allonge",
  longue_distance: "Longue distance",
  dialyse: "Dialyse",
  chimiotherapie: "Chimiotherapie",
  radiotherapie: "Radiotherapie",
  soins_iteratifs: "Soins iteratifs",
  urgence: "Urgence",
  domicile_etablissement: "Domicile <-> etablissement",
  etablissement_etablissement: "Etablissement <-> etablissement",
  ruralite: "Ruralite",
  ile_de_france: "Ile-de-France",
};

function labelMetier(c: string) {
  return METIER_LABELS[c] || c;
}
function labelActivite(c: string) {
  return ACTIVITE_LABELS[c] || c;
}

export async function generateConformiteReportPDF(
  data: ConformiteReportData
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([A4_W, A4_H]);

  const ctx: PageCtx = { doc, page, y: A4_H - MARGIN_TOP, font, fontBold };

  // ===== Header =====
  ctx.page.drawRectangle({
    x: 0,
    y: A4_H - 80,
    width: A4_W,
    height: 80,
    color: COLOR_PRIMARY,
  });
  ctx.page.drawText("Rapport de conformite reglementaire", {
    x: MARGIN_X,
    y: A4_H - 45,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  ctx.page.drawText("RoullePro - Transport sanitaire", {
    x: MARGIN_X,
    y: A4_H - 65,
    size: 11,
    font,
    color: rgb(0.85, 0.92, 1),
  });
  ctx.y = A4_H - 110;

  // ===== Identite entreprise =====
  const proName =
    data.pro.nom_commercial || data.pro.raison_sociale || "Entreprise";
  drawText(ctx, proName, { size: 16, bold: true });
  moveY(ctx, 22);

  const subline: string[] = [];
  if (data.pro.ville) subline.push(data.pro.ville);
  if (data.pro.departement) subline.push(data.pro.departement);
  if (data.pro.categorie) subline.push(data.pro.categorie);
  if (subline.length > 0) {
    drawText(ctx, subline.join(" - "), { size: 10, color: COLOR_MUTED });
    moveY(ctx, 16);
  }

  drawText(
    ctx,
    `Genere le ${data.generatedAt.toLocaleDateString("fr-FR")} a ${data.generatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
    { size: 9, color: COLOR_MUTED }
  );
  moveY(ctx, 18);
  drawDivider(ctx);

  // ===== Score =====
  ensureSpace(ctx, 80);
  drawText(ctx, "Score de conformite", { size: 13, bold: true });
  moveY(ctx, 22);

  const scoreCol = scoreColor(data.score);
  ctx.page.drawCircle({
    x: MARGIN_X + 35,
    y: ctx.y - 5,
    size: 32,
    borderColor: scoreCol,
    borderWidth: 3,
  });
  ctx.page.drawText(`${data.score}`, {
    x: MARGIN_X + 22,
    y: ctx.y - 14,
    size: 22,
    font: fontBold,
    color: scoreCol,
  });
  ctx.page.drawText("/100", {
    x: MARGIN_X + 80,
    y: ctx.y - 6,
    size: 11,
    font,
    color: COLOR_MUTED,
  });
  ctx.page.drawText(stripAccents(scoreLabel(data.score)), {
    x: MARGIN_X + 80,
    y: ctx.y - 22,
    size: 13,
    font: fontBold,
    color: scoreCol,
  });
  moveY(ctx, 60);

  drawDivider(ctx);

  // ===== Profil declare =====
  drawText(ctx, "Profil declare", { size: 13, bold: true });
  moveY(ctx, 20);

  if (data.profile.metiers.length > 0) {
    drawParagraph(
      ctx,
      `Metiers : ${data.profile.metiers.map(labelMetier).join(", ")}`,
      { size: 10 }
    );
  }
  if (data.profile.activites.length > 0) {
    drawParagraph(
      ctx,
      `Activites : ${data.profile.activites.map(labelActivite).join(", ")}`,
      { size: 10 }
    );
  }
  if (data.profile.region_code) {
    drawParagraph(ctx, `Region principale : ${data.profile.region_code}`, {
      size: 10,
    });
  }
  if (data.profile.fleet_size !== null) {
    drawParagraph(ctx, `Taille de flotte : ${data.profile.fleet_size}`, {
      size: 10,
    });
  }
  drawParagraph(
    ctx,
    `Certification SEFi : ${data.profile.sefi_certified ? "Oui" : "Non"}`,
    { size: 10 }
  );
  moveY(ctx, 6);
  drawDivider(ctx);

  // ===== Alertes pertinentes =====
  drawText(ctx, `Alertes pertinentes (${data.alerts.length})`, {
    size: 13,
    bold: true,
  });
  moveY(ctx, 20);

  if (data.alerts.length === 0) {
    drawParagraph(
      ctx,
      "Aucune alerte ne concerne actuellement votre perimetre.",
      { size: 10, color: COLOR_MUTED }
    );
  } else {
    for (const a of data.alerts) {
      ensureSpace(ctx, 56);
      drawText(ctx, `- ${a.title_short}`, { size: 11, bold: true });
      moveY(ctx, 14);
      const parts: string[] = [];
      parts.push(URGENCY_LABEL[a.urgency] || a.urgency);
      if (a.applicable_from) parts.push(`applicable ${formatFr(a.applicable_from)}`);
      if (a.deadline) parts.push(`echeance ${formatFr(a.deadline)}`);
      parts.push(`progression ${a.checked}/${a.total} items`);
      drawText(ctx, parts.join(" | "), {
        size: 9,
        color: COLOR_MUTED,
        x: MARGIN_X + 12,
      });
      moveY(ctx, 16);
    }
  }
  moveY(ctx, 4);
  drawDivider(ctx);

  // ===== Calendrier echeances a venir =====
  drawText(ctx, "Calendrier des echeances a venir", { size: 13, bold: true });
  moveY(ctx, 20);

  const future = data.deadlines.filter((d) => d.status !== "past");
  if (future.length === 0) {
    drawParagraph(ctx, "Aucune echeance a venir enregistree.", {
      size: 10,
      color: COLOR_MUTED,
    });
  } else {
    for (const d of future) {
      ensureSpace(ctx, 30);
      const dot = d.status === "soon" ? COLOR_WARN : COLOR_PRIMARY;
      ctx.page.drawCircle({
        x: MARGIN_X + 4,
        y: ctx.y + 4,
        size: 3,
        color: dot,
      });
      drawText(ctx, `${formatFr(d.due_date)} - ${d.label}`, {
        size: 10,
        bold: true,
        x: MARGIN_X + 14,
      });
      moveY(ctx, 13);
      drawText(
        ctx,
        `${KIND_LABEL[d.kind] || d.kind} | ${d.alert_title}`,
        { size: 9, color: COLOR_MUTED, x: MARGIN_X + 14 }
      );
      moveY(ctx, 14);
    }
  }
  moveY(ctx, 6);
  drawDivider(ctx);

  // ===== Footer =====
  const totalPages = doc.getPageCount();
  for (let i = 0; i < totalPages; i += 1) {
    const p = doc.getPage(i);
    p.drawText(
      stripAccents(
        `Document genere par RoullePro le ${data.generatedAt.toLocaleDateString("fr-FR")} - roullepro.com`
      ),
      {
        x: MARGIN_X,
        y: 30,
        size: 8,
        font,
        color: COLOR_MUTED,
      }
    );
    p.drawText(`${i + 1} / ${totalPages}`, {
      x: A4_W - MARGIN_X - 30,
      y: 30,
      size: 8,
      font,
      color: COLOR_MUTED,
    });
  }

  return await doc.save();
}
