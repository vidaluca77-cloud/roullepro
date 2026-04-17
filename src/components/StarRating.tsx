'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  note: number;           // note actuelle (0-5)
  max?: number;           // max étoiles (défaut 5)
  size?: number;          // taille icône
  interactive?: boolean;  // cliquable pour choisir
  onChange?: (note: number) => void;
  className?: string;
}

export default function StarRating({
  note,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  className = '',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const displayNote = interactive && hovered > 0 ? hovered : note;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const val = i + 1;
        const filled = val <= displayNote;
        return (
          <Star
            key={i}
            size={size}
            className={`transition-colors ${
              filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={interactive && onChange ? () => onChange(val) : undefined}
            onMouseEnter={interactive ? () => setHovered(val) : undefined}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
          />
        );
      })}
    </div>
  );
}
