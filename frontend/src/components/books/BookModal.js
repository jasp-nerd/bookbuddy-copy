import React from 'react';
import { X } from 'lucide-react';
import StarRating from '../common/StarRating';

const BookModal = ({ book, open, onClose }) => {
  if (!open || !book) return null;
  const { volumeInfo = {} } = book;
  const { title, authors, imageLinks, description, averageRating, ratingsCount } = volumeInfo;
  const coverImage = imageLinks?.thumbnail || imageLinks?.smallThumbnail;
  const authorNames = authors?.join(', ') || 'Unknown Author';
  
  // Default book cover placeholder
  const defaultCover = '/placeholder-book.svg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-book-400 hover:text-book-900"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex space-x-6">
          <img
            src={coverImage || defaultCover}
            alt={title}
            className="w-28 h-40 object-cover rounded-lg shadow"
            onError={e => { e.target.src = defaultCover; }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-book-900 mb-2">{title}</h2>
            <p className="text-book-600 mb-2">by {authorNames}</p>
            {averageRating && (
              <div className="flex items-center space-x-2 mb-2">
                <StarRating rating={averageRating} readonly size="md" />
                <span className="text-xs text-book-500">({ratingsCount || 0})</span>
              </div>
            )}
            {description && (
              <p className="text-book-700 text-sm line-clamp-5">{description.replace(/<[^>]*>/g, '')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal; 