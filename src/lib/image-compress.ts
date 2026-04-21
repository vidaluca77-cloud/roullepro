/**
 * Compression image cote client pour reduire la taille et la dimension
 * avant upload. Supporte HEIC iOS via conversion en JPEG.
 *
 * - Redimensionne au max MAX_DIM px (cote le plus long)
 * - Sortie JPEG qualite 0.85
 * - Retourne un File compresse (ou l'original si deja <= maxSizeKB et dimension ok)
 */

const MAX_DIM = 2048;
const QUALITY = 0.85;

export async function compressImage(
  file: File,
  options?: { maxDim?: number; quality?: number; maxSizeKB?: number }
): Promise<File> {
  const maxDim = options?.maxDim ?? MAX_DIM;
  const quality = options?.quality ?? QUALITY;
  const maxSizeKB = options?.maxSizeKB ?? 2000;

  // Cas ou pas de compression necessaire (petit fichier, format standard)
  if (
    file.size <= maxSizeKB * 1024 &&
    (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")
  ) {
    // Encore, on verifie la dimension. Si on ne peut pas lire, on retourne tel quel.
    try {
      const dims = await readImageDimensions(file);
      if (dims.width <= maxDim && dims.height <= maxDim) {
        return file;
      }
    } catch {
      return file;
    }
  }

  try {
    const img = await loadImage(file);

    // Calcul dimensions cibles en preservant ratio
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
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
