import React from 'react';
import StarRating from '../common/StarRating';

const ReviewCard = ({ review }) => {
  return (
    <div className="p-4 border border-book-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-book-900">{review.user}</span>
        <StarRating rating={review.rating} readonly size="sm" />
        <span className="text-xs text-book-500">{new Date(review.date).toLocaleDateString()}</span>
      </div>
      {review.message && (
        <p className="text-book-700">{review.message}</p>
      )}
    </div>
  );
};

export default ReviewCard; 