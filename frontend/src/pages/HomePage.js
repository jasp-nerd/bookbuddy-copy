import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useUser } from '../context/UserContext';
import { bookAPI } from '../services/api';
import SearchBar from '../components/common/SearchBar';
import BookCard from '../components/books/BookCard';
import { BookOpen, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useUser();
  const [searchResults, setSearchResults] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loadingPopularBooks, setLoadingPopularBooks] = useState(false);

  // Fetch most favorited books
  const { data: mostFavorites, isLoading: loadingFavorites } = useQuery(
    'mostFavorites',
    () => bookAPI.getMostFavorites(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch recommendations if user is authenticated
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery(
    ['recommendations', currentUser?.id],
    () => bookAPI.getRecommendations(currentUser.id),
    {
      enabled: !!currentUser?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch details for popular books when mostFavorites changes
  useEffect(() => {
    const fetchPopularBooks = async () => {
      if (mostFavorites?.most_favorites && Array.isArray(mostFavorites.most_favorites)) {
        setLoadingPopularBooks(true);
        try {
          const bookPromises = mostFavorites.most_favorites.slice(0, 6).map((bookId) => bookAPI.getBook(bookId));
          const books = await Promise.all(bookPromises);
          setPopularBooks(books.filter(Boolean));
        } catch (err) {
          setPopularBooks([]);
        } finally {
          setLoadingPopularBooks(false);
        }
      } else {
        setPopularBooks([]);
      }
    };
    fetchPopularBooks();
  }, [mostFavorites]);

  const handleSearch = (query, filters) => {
    navigate('/search', { 
      state: { 
        query, 
        filters,
        searchResults: null 
      } 
    });
  };

  const getBookDetails = async (bookId) => {
    try {
      return await bookAPI.getBook(bookId);
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  };

  const renderBookGrid = (books, title, icon, emptyMessage, maxBooks = 6) => {
    if (!books || books.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-book-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.slice(0, maxBooks).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-book-900">
          Discover Your Next
          <span className="text-primary-600"> Favorite Book</span>
        </h1>
        <p className="text-xl text-book-600 max-w-2xl mx-auto">
          BookBuddy helps you find amazing books, track your reading journey, and get personalized recommendations.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Recommendations Section */}
      {isAuthenticated && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-book-900">
                Recommended for You
              </h2>
            </div>
            <Link
              to="/recommendations"
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="book-card animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-20 h-28 bg-book-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-book-200 rounded w-3/4"></div>
                      <div className="h-3 bg-book-200 rounded w-1/2"></div>
                      <div className="h-3 bg-book-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations?.recommendations?.items ? (
            <div>
              {recommendations.genre && (
                <p className="text-book-600 mb-4">
                  Based on your love for <span className="font-medium">{recommendations.genre}</span> books
                </p>
              )}
              {renderBookGrid(
                recommendations.recommendations.items,
                'Recommended for You',
                Sparkles,
                'No recommendations available yet. Add some books to your favorites!'
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-book-500">
                Add some books to your favorites to get personalized recommendations!
              </p>
            </div>
          )}
        </section>
      )}

      {/* Popular Books Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-book-900">
              Most Popular Books
            </h2>
          </div>
        </div>

        {loadingFavorites || loadingPopularBooks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="book-card animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-20 h-28 bg-book-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-book-200 rounded w-3/4"></div>
                    <div className="h-3 bg-book-200 rounded w-1/2"></div>
                    <div className="h-3 bg-book-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : popularBooks.length > 0 ? (
          <div className="space-y-6">
            <p className="text-book-600">
              Books that readers love the most
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-book-500">No popular books available yet.</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-8 text-center text-white">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            Start Your Reading Journey
          </h3>
          <p className="text-primary-100 mb-6 max-w-md mx-auto">
            Create your account to track your favorite books, get personalized recommendations, and join the BookBuddy community.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}
    </div>
  );
};

export default HomePage; 