import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 14,
  className = ""
}) => {
  const id = React.useId();
  const gradientId = `halfStarGrad-${id.replace(/:/g, '')}`;
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(maxRating, rating)) : 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.3 && safeRating % 1 < 0.8;
  const actualFullStars = safeRating % 1 >= 0.8 ? fullStars + 1 : fullStars;
  const showHalfStar = hasHalfStar && actualFullStars < maxRating;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(actualFullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-amber-400 text-amber-400"
          strokeWidth={2}
        />
      ))}
      {showHalfStar && (
        <svg width={size} height={size} viewBox="0 0 24 24" className="text-amber-400">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#${gradientId})`}
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      )}
      {[...Array(Math.max(0, maxRating - actualFullStars - (showHalfStar ? 1 : 0)))].map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="fill-slate-100 text-slate-200"
          strokeWidth={2}
        />
      ))}
    </div>
  );
};
