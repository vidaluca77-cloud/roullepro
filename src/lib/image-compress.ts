/**
 * Compression image cote client robuste et progressive.
 *
 * Strategie :
 * - Redimensionne en etapes (2560 -> 1920 -> 1600 -> 1280) jusqu'a passer sous targetSizeKB
 * - Baisse la qualite si toujours trop gros (0.85 -> 0.75 -> 0.65 -> 0.55)
 * - Convertit tout (HEIC, PNG, WebP) en JPEG pour compatibilite universelle
 * - Retourne un File JPEG pret a uploader
 * - Si compression impossible (e.g. HEIC non decode par le navigateur), retourne l'original
 *   pour laisser Supabase essayer (limite serveur = 50Mo)
 */

export async function compressImage(
  file: File,
  options?: { targetSizeKB?: number; maxDim?: number }
): Promise<File> {
  const targetSizeKB = options?.targetSizeKB ?? 2500; // 2.5 Mo cible
  const maxDimStart = options?.maxDim ?? 2560;

  // Si deja petit et format standard, on ne touche pas
  const typeLower = (file.type || "").toLowerCase();
  const isStandardFormat =
    typeLower === "image/jpeg" || typeLower === "image/png" || typeLower === "image/webp";

  if (file.size <= targetSizeKB * 1024 && isStandardFormat) {
    return file;
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    // Navigateur ne sait pas decoder (rare HEIC tres specifique). On laisse passer.
    return file;
  }

  const dims = [maxDimStart, 1920, 1600, 1280, 1024];
  const qualities = [0.85, 0.75, 0.65, 0.55];

  for (const maxDim of dims) {
    for (const q of qualities) {
      const blob = await render(img, maxDim, q);
      if (!blob) continue;
      if (blob.size <= targetSizeKB * 1024) {
        return blobToFile(blob, file.name);
      }
    }
  }

  // En dernier recours : plus petite version meme si encore un peu au-dessus
  const fallback = await render(img, 1024, 0.55);
  if (fallback) return blobToFile(fallback, file.name);

  return file;
}

function render(img: HTMLImageElement, maxDim: number, quality: number): Promise<Blob | null> {
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  // Fond blanc pour PNG transparents
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

function blobToFile(blob: Blob, originalName: string): File {
  const newName = originalName.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
}

function loadImage(file: File): Promise<HTMLImageElement> {
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
