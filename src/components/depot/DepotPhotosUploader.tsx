"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, X, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

type Props = {
  photos: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
};

const BUCKET = "depot-vente-photos";
// On accepte grand en entree, la compression cote client ramene tout a ~2.5 Mo
const MAX_INPUT_MB = 50;

export default function DepotPhotosUploader({
  photos,
  onChange,
  max = 12,
  disabled = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} photos atteint.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);

    setUploading(true);
    setProgress({ current: 0, total: toUpload.length });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez etre connecte pour ajouter des photos.");
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const newUrls: string[] = [];

      for (let i = 0; i < toUpload.length; i++) {
        const rawFile = toUpload[i];
        setProgress({ current: i + 1, total: toUpload.length });

        // Filtre tres permissif : on accepte tout ce qui ressemble a une image
        const typeLower = (rawFile.type || "").toLowerCase();
        const nameLower = rawFile.name.toLowerCase();
        const looksLikeImage =
          typeLower.startsWith("image/") ||
          /\.(jpg|jpeg|png|webp|heic|heif|avif|gif|bmp)$/i.test(nameLower);

        if (!looksLikeImage) {
          failCount++;
          continue;
        }

        // Cap tres large en entree (50 Mo) : au-dela c'est probablement une erreur
        if (rawFile.size > MAX_INPUT_MB * 1024 * 1024) {
          failCount++;
          continue;
        }

        // Compression cote client (agressive : vise 2.5 Mo)
        let file: File;
        try {
          file = await compressImage(rawFile, { targetSizeKB: 2500, maxDim: 2560 });
        } catch {
          file = rawFile;
        }

        // Si la compression n'a pas suffi (rare : grosse photo + navigateur recalcitrant),
        // on retente une passe encore plus agressive
        if (file.size > 8 * 1024 * 1024) {
          try {
            file = await compressImage(file, { targetSizeKB: 2000, maxDim: 1600 });
          } catch {
            // on garde tel quel, Supabase accepte jusqu'a 50Mo
          }
        }

        // Extension finale : .jpg si on a compresse (File.type = image/jpeg),
        // sinon on garde l'extension d'origine
        const finalType = file.type || "image/jpeg";
        const ext =
          finalType === "image/jpeg"
            ? "jpg"
            : finalType === "image/png"
            ? "png"
            : finalType === "image/webp"
            ? "webp"
            : "jpg";
        const path = `${user.id}/${Date.now()}-${i}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: finalType,
          });

        if (upErr) {
          failCount++;
          continue;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        newUrls.push(data.publicUrl);
        successCount++;
      }

      if (newUrls.length > 0) {
        onChange([...photos, ...newUrls]);
      }

      if (failCount > 0 && successCount === 0) {
        setError(`Aucune photo n'a pu etre envoyee. Reessayez ou choisissez d'autres photos.`);
      } else if (failCount > 0) {
        setError(`${successCount} photo(s) ajoutee(s), ${failCount} non envoyee(s).`);
      }
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  const canAdd = photos.length < max && !disabled;

  return (
    <div>
      {/* Photos existantes */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
          {photos.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-white/95 text-red-600 flex items-center justify-center shadow-md active:scale-95"
                  aria-label="Supprimer la photo"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UN SEUL gros bouton. Sur mobile le navigateur propose nativement
          Camera / Photos / Fichiers via accept=image/* sans capture */}
      {canAdd && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 text-white font-bold rounded-xl py-5 px-4 shadow-sm transition"
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span>
                {progress ? `Envoi ${progress.current}/${progress.total}...` : "Envoi..."}
              </span>
            </>
          ) : (
            <>
              <Camera size={22} />
              <span className="text-base">
                {photos.length === 0 ? "Ajouter des photos" : "Ajouter d'autres photos"}
              </span>
            </>
          )}
        </button>
      )}

      {/* Input file ultra-permissif : multiple, pas de capture (laisse le navigateur
          proposer le menu natif camera/galerie/fichiers sur mobile) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2">
        <p className="text-xs text-slate-500">
          {photos.length} / {max} photos &middot; redimensionnement automatique
        </p>
        {error && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
