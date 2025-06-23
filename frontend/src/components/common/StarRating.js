import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showValue = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const handleStarClick = (starIndex) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starIndex + 1);
  };

  const handleStarHover = (starIndex) => {
    if (readonly) return;
    // Optional: Add hover effects here
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleStarHover(index)}
            disabled={readonly}
            className={`transition-colors duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                index < Math.floor(rating)
                  ? 'text-yellow-400 fill-current'
                  : index < rating
                  ? 'text-yellow-400 fill-current opacity-60'
                  : 'text-book-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm text-book-600 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'No rating'}
        </span>
      )}
    </div>
  );
};

export default StarRating; 