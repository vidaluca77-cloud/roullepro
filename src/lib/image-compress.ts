/**
 * Compression image cote client robuste, specialement optimisee pour PNG lourds
 * (screenshots iPhone, captures d'ecran) et formats varies (HEIC, WebP, AVIF).
 *
 * Strategie :
 * 1. Utilise createImageBitmap quand dispo (beaucoup plus fiable que Image() sur iOS
 *    Safari pour les grandes images, contourne la limite de taille canvas)
 * 2. Convertit TOUJOURS les non-JPEG en JPEG (PNG transparents -> fond blanc)
 * 3. Reduction progressive de dimension + qualite jusqu'a passer sous la cible
 * 4. Fallback gracieux en cas d'echec canvas (retourne l'original, Supabase accepte 50Mo)
 */

type CompressOptions = {
  targetSizeKB?: number;
  maxDim?: number;
};

export async function compressImage(file: File, options?: CompressOptions): Promise<File> {
  const targetSizeKB = options?.targetSizeKB ?? 2500;
  const maxDimStart = options?.maxDim ?? 2560;

  const typeLower = (file.type || "").toLowerCase();
  const nameLower = file.name.toLowerCase();
  const isPng = typeLower === "image/png" || nameLower.endsWith(".png");
  const isJpeg = typeLower === "image/jpeg" || /\.jpe?g$/i.test(nameLower);

  // Shortcut : JPEG deja petit et format standard, on passe
  if (isJpeg && file.size <= targetSizeKB * 1024) {
    return file;
  }

  // Pour tout le reste (PNG, HEIC, WebP, AVIF, JPEG trop gros) on compresse
  const bitmap = await decodeImage(file);
  if (!bitmap) {
    // Impossible a decoder : on retourne l'original. Supabase acceptera jusqu'a 50Mo.
    return file;
  }

  // Si PNG, on force la conversion JPEG meme si "petit" car un PNG de 3Mo peut
  // devenir un JPEG de 200Ko. Energie max de compression.
  const sizes = [maxDimStart, 1920, 1600, 1280, 1024, 800];
  const qualities = [0.85, 0.78, 0.7, 0.6, 0.5];

  for (const maxDim of sizes) {
    for (const q of qualities) {
      const blob = await render(bitmap, maxDim, q);
      if (!blob) continue;
      if (blob.size <= targetSizeKB * 1024) {
        releaseBitmap(bitmap);
        return blobToFile(blob, file.name);
      }
    }
  }

  // Dernier recours : version minimale acceptable
  const fallback = await render(bitmap, 800, 0.5);
  releaseBitmap(bitmap);
  if (fallback) return blobToFile(fallback, file.name);

  return file;
}

// Decode une image en utilisant la meilleure methode disponible
async function decodeImage(
  file: File
): Promise<ImageBitmap | HTMLImageElement | null> {
  // Prefere createImageBitmap : plus rapide, plus fiable, gere plus de formats
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return bitmap;
    } catch {
      // fallback Image()
    }
  }

  try {
    return await loadImageElement(file);
  } catch {
    return null;
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const cleanup = () => URL.revokeObjectURL(url);
    img.onload = () => {
      cleanup();
      resolve(img);
    };
    img.onerror = (e) => {
      cleanup();
      reject(e);
    };
    img.src = url;
  });
}

function releaseBitmap(source: ImageBitmap | HTMLImageElement) {
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    try {
      source.close();
    } catch {
      // ignore
    }
  }
}

async function render(
  source: ImageBitmap | HTMLImageElement,
  maxDim: number,
  quality: number
): Promise<Blob | null> {
  const srcW = "width" in source ? source.width : 0;
  const srcH = "height" in source ? source.height : 0;
  if (!srcW || !srcH) return null;

  let width = srcW;
  let height = srcH;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  // Garde-fou iOS Safari : limite canvas ~16M pixels
  const MAX_PIXELS = 16_000_000;
  if (width * height > MAX_PIXELS) {
    const ratio = Math.sqrt(MAX_PIXELS / (width * height));
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fond blanc pour les PNG transparents -> evite JPEG avec fond noir
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

function blobToFile(blob: Blob, originalName: string): File {
  const newName = originalName.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
}
