import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { useUser } from '../context/UserContext';
import { bookAPI, userListsAPI, reviewsAPI } from '../services/api';
import StarRating from '../components/common/StarRating';
import { Heart, BookOpen, Clock, Star, MessageSquare, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const BookDetailPage = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useUser();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    message: '',
  });

  // Fetch book details
  const { data: book, isLoading: loadingBook, error: bookError } = useQuery(
    ['book', id],
    () => bookAPI.getBook(id),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch book reviews
  const { data: reviewsData, isLoading: loadingReviews } = useQuery(
    ['bookReviews', id],
    () => reviewsAPI.getBookReviews(id),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Check if user has reviewed this book
  const userReview = reviewsData?.reviews?.find(
    review => review.user === currentUser?.id
  );

  const handleAddToList = async (listType) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your book lists');
      return;
    }

    try {
      const userId = currentUser.id;
      let apiCall;

      switch (listType) {
        case 'favorites':
          apiCall = userListsAPI.addToFavorites(userId, id);
          break;
        case 'read':
          apiCall = userListsAPI.addToReadBooks(userId, id);
          break;
        case 'wantToRead':
          apiCall = userListsAPI.addToWantToRead(userId, id);
          break;
        default:
          return;
      }

      await apiCall;
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(['favoriteBooks', userId]);
      queryClient.invalidateQueries(['readBooks', userId]);
      queryClient.invalidateQueries(['wantToReadBooks', userId]);
      
      toast.success(`Added "${book.volumeInfo.title}" to your ${listType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } catch (error) {
      console.error('Error adding book to list:', error);
      toast.error('Failed to add book to list');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await reviewsAPI.submitReview(
        id,
        currentUser.id,
        reviewForm.rating,
        reviewForm.message
      );
      
      // Invalidate reviews query to refresh data
      queryClient.invalidateQueries(['bookReviews', id]);
      
      // Reset form
      setReviewForm({ rating: 0, message: '' });
      setShowReviewForm(false);
      
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleDeleteReview = async () => {
    if (!isAuthenticated || !userReview) return;

    try {
      await reviewsAPI.deleteReview(currentUser.id, id);
      
      // Invalidate reviews query to refresh data
      queryClient.invalidateQueries(['bookReviews', id]);
      
      toast.success('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  if (loadingBook) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-2 text-book-600">Loading book details...</span>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">Error loading book</p>
        <p className="text-book-500 text-sm mb-4">{bookError?.message}</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  const {
    volumeInfo: {
      title,
      authors,
      imageLinks,
      averageRating,
      ratingsCount,
      publishedDate,
      description,
      pageCount,
      categories,
      language,
      publisher,
    } = {},
  } = book;

  const coverImage = imageLinks?.thumbnail || imageLinks?.smallThumbnail;
  const authorNames = authors?.join(', ') || 'Unknown Author';
  const publishedYear = publishedDate ? new Date(publishedDate).getFullYear() : 'Unknown';
  const reviews = reviewsData?.reviews || [];

  // Default book cover placeholder
  const defaultCover = '/placeholder-book.svg';

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-book-600 hover:text-book-900 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Book Details */}
      <div className="bg-white rounded-lg shadow-sm border border-book-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <img
              src={coverImage || defaultCover}
              alt={title}
              className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              onError={(e) => {
                e.target.src = defaultCover;
              }}
            />
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-book-900 mb-2">{title}</h1>
              <p className="text-xl text-book-600 mb-4">by {authorNames}</p>
              
              {/* Rating */}
              {averageRating && (
                <div className="flex items-center space-x-2 mb-4">
                  <StarRating rating={averageRating} readonly size="lg" />
                  <span className="text-book-600">
                    {averageRating.toFixed(1)} ({ratingsCount || 0} ratings)
                  </span>
                </div>
              )}
            </div>

            {/* Book Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-book-700">Published:</span>
                <span className="ml-2 text-book-600">{publishedYear}</span>
              </div>
              {pageCount && (
                <div>
                  <span className="font-medium text-book-700">Pages:</span>
                  <span className="ml-2 text-book-600">{pageCount}</span>
                </div>
              )}
              {language && (
                <div>
                  <span className="font-medium text-book-700">Language:</span>
                  <span className="ml-2 text-book-600">{language.toUpperCase()}</span>
                </div>
              )}
              {publisher && (
                <div>
                  <span className="font-medium text-book-700">Publisher:</span>
                  <span className="ml-2 text-book-600">{publisher}</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {categories && (
              <div>
                <span className="font-medium text-book-700">Categories:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <h3 className="font-medium text-book-700 mb-2">Description</h3>
                <p className="text-book-600 leading-relaxed">
                  {description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isAuthenticated && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-book-200">
                <button
                  onClick={() => handleAddToList('favorites')}
                  className="flex items-center space-x-2 btn-outline hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                >
                  <Heart className="w-4 h-4" />
                  <span>Add to Favorites</span>
                </button>
                
                <button
                  onClick={() => handleAddToList('read')}
                  className="flex items-center space-x-2 btn-outline hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Mark as Read</span>
                </button>
                
                <button
                  onClick={() => handleAddToList('wantToRead')}
                  className="flex items-center space-x-2 btn-outline hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  <Clock className="w-4 h-4" />
                  <span>Want to Read</span>
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="pt-4 border-t border-book-200">
                <p className="text-book-500">
                  <Link to="/login" className="text-primary-600 hover:text-primary-700">
                    Login
                  </Link>{' '}
                  to manage your book lists and write reviews
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm border border-book-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-book-900">Reviews</h2>
            <span className="text-sm text-book-500">({reviews.length})</span>
          </div>
          
          {isAuthenticated && !userReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-6 p-6 bg-book-50 rounded-lg border border-book-200">
            <h3 className="text-lg font-semibold text-book-900 mb-4">Write Your Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-book-700 mb-2">
                  Rating *
                </label>
                <StarRating
                  rating={reviewForm.rating}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                  size="lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-book-700 mb-2">
                  Review (optional)
                </label>
                <textarea
                  value={reviewForm.message}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Share your thoughts about this book..."
                  className="input-field h-32 resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary">
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User's Review */}
        {userReview && (
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-book-900">Your Review</h4>
              <button
                onClick={handleDeleteReview}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
            <StarRating rating={userReview.rating} readonly />
            {userReview.message && (
              <p className="text-book-700 mt-2">{userReview.message}</p>
            )}
          </div>
        )}

        {/* Reviews List */}
        {loadingReviews ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-2 text-book-600">Loading reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews
              .filter(review => review.user !== currentUser?.id) // Don't show user's own review in the list
              .map((review, index) => (
                <div key={index} className="p-4 border border-book-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-book-900">{review.user}</span>
                    <StarRating rating={review.rating} readonly size="sm" />
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
            <p className="text-book-600">No reviews yet. Be the first to review this book!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage; 