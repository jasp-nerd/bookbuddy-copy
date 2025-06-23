import React from 'react';
import { useUser } from '../context/UserContext';
import { useQuery } from 'react-query';
import { bookAPI } from '../services/api';
import BookCard from '../components/books/BookCard';
import { Sparkles, Loader, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationsPage = () => {
  const { currentUser, isAuthenticated } = useUser();

  const { data, isLoading, error } = useQuery(
    ['recommendations', currentUser?.id],
    () => bookAPI.getRecommendations(currentUser.id),
    {
      enabled: !!currentUser?.id,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 text-book-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-book-900 mb-2">Personalized Recommendations</h2>
        <p className="text-book-600 mb-6">Sign in to get personalized book recommendations</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-primary-600" />
        <h1 className="text-3xl font-bold text-book-900">Recommended for You</h1>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="ml-2 text-book-600">Loading recommendations...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading recommendations</p>
          <p className="text-book-500 text-sm mb-4">{error.message}</p>
          <Link to="/" className="btn-primary"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Link>
        </div>
      ) : data?.recommendations?.items ? (
        <>
          {data.genre && (
            <p className="text-book-600 mb-4">
              Based on your love for <span className="font-medium">{data.genre}</span> books
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recommendations.items.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-book-500">No recommendations available yet. Add some books to your favorites!</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage; 