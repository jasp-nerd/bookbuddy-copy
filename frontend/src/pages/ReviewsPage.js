import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useQuery } from 'react-query';
import { reviewsAPI } from '../services/api';
import StarRating from '../components/common/StarRating';
import { MessageSquare, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewsPage = () => {
  const { currentUser, isAuthenticated } = useUser();
  const [sortBy, setSortBy] = useState('rating');
  const [order, setOrder] = useState('desc');

  const { data, isLoading, error } = useQuery(
    ['sortedReviews', sortBy, order],
    () => reviewsAPI.getSortedReviews(sortBy, order),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-book-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-book-900 mb-2">All Reviews</h2>
        <p className="text-book-600 mb-6">Sign in to view and manage reviews</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-6 h-6 text-primary-600" />
        <h1 className="text-3xl font-bold text-book-900">All Reviews</h1>
      </div>
      <div className="flex flex-wrap gap-4 items-center mt-4">
        <label className="text-sm font-medium text-book-700">Sort by:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-32">
          <option value="rating">Rating</option>
          <option value="date">Date</option>
        </select>
        <select value={order} onChange={e => setOrder(e.target.value)} className="input-field w-32">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="ml-2 text-book-600">Loading reviews...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading reviews</p>
          <p className="text-book-500 text-sm mb-4">{error.message}</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((review, idx) => (
            <div key={idx} className="p-4 border border-book-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-book-900">{review.user}</span>
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-xs text-book-500">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              {review.message && (
                <p className="text-book-700">{review.message}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-book-300 mx-auto mb-4" />
          <p className="text-book-600">No reviews found.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage; 