"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, X, Loader2, ImagePlus, ImageIcon } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

type Props = {
  photos: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
};

const BUCKET = "depot-vente-photos";
const MAX_SIZE_MB = 10; // on accepte plus grand car on compresse ensuite

export default function DepotPhotosUploader({
  photos,
  onChange,
  max = 12,
  disabled = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) {
      setError(`Maximum ${max} photos.`);
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: toUpload.length });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez etre connecte pour televerser des photos.");
        return;
      }

      const urls: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const rawFile = toUpload[i];
        setProgress({ current: i + 1, total: toUpload.length });

        // Accepter tout type image (y compris HEIC/HEIF iOS qui sera converti)
        const typeLower = (rawFile.type || "").toLowerCase();
        const nameLower = rawFile.name.toLowerCase();
        const isImage =
          typeLower.startsWith("image/") ||
          nameLower.endsWith(".heic") ||
          nameLower.endsWith(".heif") ||
          nameLower.endsWith(".jpg") ||
          nameLower.endsWith(".jpeg") ||
          nameLower.endsWith(".png") ||
          nameLower.endsWith(".webp");

        if (!isImage) {
          setError("Seules les images sont acceptees.");
          continue;
        }

        if (rawFile.size > MAX_SIZE_MB * 1024 * 1024 * 3) {
          // Photo vraiment enorme (>30Mo) : on refuse
          setError(`Photo trop lourde. Reduisez avant d'envoyer.`);
          continue;
        }

        // Compression cote client (reduit dimension + convertit HEIC en JPEG)
        let file: File;
        try {
          file = await compressImage(rawFile, { maxDim: 2048, quality: 0.85 });
        } catch {
          file = rawFile;
        }

        // Si apres compression toujours trop gros, on refuse
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`Photo trop lourde meme apres compression.`);
          continue;
        }

        const ext = (file.type === "image/jpeg" ? "jpg" : file.name.split(".").pop()?.toLowerCase()) || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "image/jpeg",
          });

        if (upErr) {
          setError(`Erreur d'envoi : ${upErr.message}`);
          continue;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      if (urls.length > 0) {
        onChange([...photos, ...urls]);
      }
    } finally {
      setUploading(false);
      setProgress(null);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  const canAdd = photos.length < max && !disabled;

  return (
    <div>
      {/* Grille des photos existantes */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
          {photos.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
            >
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-white/95 hover:bg-white text-red-600 flex items-center justify-center shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition"
                  aria-label="Supprimer la photo"
                >
                  <X size={14} />
                </button>
              )}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Boutons d'ajout : 2 CTA distincts sur mobile (Camera / Galerie) */}
      {canAdd && (
        <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
          {isMobile && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl py-4 px-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              <span className="text-sm">Prendre photo</span>
            </button>
          )}
          <button
            type="button"
            disabled={uploading}
            onClick={() => galleryInputRef.current?.click()}
            className={`flex items-center justify-center gap-2 border-2 border-dashed ${
              isMobile
                ? "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700"
                : "border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-700"
            } font-semibold rounded-xl py-4 px-3 transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">
                  {progress ? `Envoi ${progress.current}/${progress.total}` : "Envoi..."}
                </span>
              </>
            ) : (
              <>
                {isMobile ? <ImageIcon size={20} /> : <ImagePlus size={20} />}
                <span className="text-sm">
                  {isMobile ? "Galerie" : photos.length === 0 ? "Ajouter des photos" : "Ajouter d'autres photos"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Inputs caches - un pour camera direct, un pour galerie */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center justify-between mt-2 gap-2">
        <p className="text-xs text-slate-500">
          {photos.length} / {max} photos &middot; redimensionnement auto
        </p>
        {error && <p className="text-xs text-red-600 text-right">{error}</p>}
      </div>
    </div>
  );
}
