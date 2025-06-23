import React, { useState } from 'react';
import StarRating from '../common/StarRating';

const ReviewForm = ({ initialRating = 0, initialMessage = '', onSubmit, onCancel }) => {
  const [rating, setRating] = useState(initialRating);
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-book-700 mb-2">Rating *</label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-book-700 mb-2">Review (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Share your thoughts about this book..."
          className="input-field h-32 resize-none"
        />
      </div>
      <div className="flex space-x-3">
        <button type="submit" className="btn-primary">Submit Review</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm; 