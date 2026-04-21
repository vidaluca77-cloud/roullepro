"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, X, Loader2, ImagePlus } from "lucide-react";

type Props = {
  photos: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
};

const BUCKET = "depot-vente-photos";
const MAX_SIZE_MB = 8;

export default function DepotPhotosUploader({
  photos,
  onChange,
  max = 12,
  disabled = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez etre connecte pour televerser des photos.");
        setUploading(false);
        return;
      }

      const urls: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          setError("Seules les images sont autorisees.");
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`Chaque photo doit faire moins de ${MAX_SIZE_MB} Mo.`);
          continue;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
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
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  const canAdd = photos.length < max && !disabled;

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-red-600 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition"
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

        {canAdd && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={22} className="animate-spin mb-1" />
                <span className="text-xs">Envoi...</span>
              </>
            ) : (
              <>
                {photos.length === 0 ? (
                  <Camera size={22} className="mb-1" />
                ) : (
                  <ImagePlus size={22} className="mb-1" />
                )}
                <span className="text-xs font-medium">
                  {photos.length === 0 ? "Ajouter" : "Ajouter"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-400">
          {photos.length} / {max} photos &middot; {MAX_SIZE_MB} Mo max par photo
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
