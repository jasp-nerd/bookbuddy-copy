import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Clock, Star, MoreHorizontal, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { userListsAPI } from '../../services/api';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const BookCard = ({ book, showActions = true, className = '', removeFromCollection = false, collectionType = null }) => {
  const { currentUser, isAuthenticated } = useUser();
  const queryClient = useQueryClient();

  const {
    id,
    volumeInfo: {
      title,
      authors,
      imageLinks,
      averageRating,
      ratingsCount,
      publishedDate,
      description,
    } = {},
  } = book;

  const coverImage = imageLinks?.thumbnail || imageLinks?.smallThumbnail;
  const authorNames = authors?.join(', ') || 'Unknown Author';
  const publishedYear = publishedDate ? new Date(publishedDate).getFullYear() : 'Unknown';

  // Default book cover placeholder
  const defaultCover = '/placeholder-book.svg';

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
      
      toast.success(`Added "${title}" to your ${listType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } catch (error) {
      console.error('Error adding book to list:', error);
      toast.error('Failed to add book to list');
    }
  };

  const handleRemoveFromList = async (listType) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your book lists');
      return;
    }

    try {
      const userId = currentUser.id;
      let apiCall;

      switch (listType) {
        case 'favorites':
          apiCall = userListsAPI.removeFromFavorites(userId, id);
          break;
        case 'read':
          apiCall = userListsAPI.removeFromReadBooks(userId, id);
          break;
        case 'wantToRead':
          apiCall = userListsAPI.removeFromWantToRead(userId, id);
          break;
        default:
          return;
      }

      await apiCall;
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(['favoriteBooks', userId]);
      queryClient.invalidateQueries(['readBooks', userId]);
      queryClient.invalidateQueries(['wantToReadBooks', userId]);
      
      toast.success(`Removed "${title}" from your ${listType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } catch (error) {
      console.error('Error removing book from list:', error);
      toast.error('Failed to remove book from list');
    }
  };

  const getRemoveButtonText = () => {
    switch (collectionType) {
      case 'favorites':
        return 'Remove from Favorites';
      case 'read':
        return 'Remove from Read';
      case 'wantToRead':
        return 'Remove from Want to Read';
      default:
        return 'Remove';
    }
  };

  const getRemoveButtonColor = () => {
    switch (collectionType) {
      case 'favorites':
        return 'hover:bg-red-50 hover:border-red-300 hover:text-red-700';
      case 'read':
        return 'hover:bg-green-50 hover:border-green-300 hover:text-green-700';
      case 'wantToRead':
        return 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700';
      default:
        return 'hover:bg-red-50 hover:border-red-300 hover:text-red-700';
    }
  };

  return (
    <div className={`book-card ${className}`}>
      <div className="flex space-x-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          <Link to={`/book/${id}`}>
            <img
              src={coverImage || defaultCover}
              alt={title}
              className="w-20 h-28 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              onError={(e) => {
                e.target.src = defaultCover;
              }}
            />
          </Link>
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/book/${id}`} className="block">
            <h3 className="text-lg font-semibold text-book-900 hover:text-primary-600 transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
          </Link>
          
          <p className="text-sm text-book-600 mt-1">
            by {authorNames}
          </p>
          
          <p className="text-xs text-book-500 mt-1">
            {publishedYear}
          </p>

          {/* Rating */}
          {averageRating && (
            <div className="flex items-center space-x-1 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-book-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-book-600">
                {averageRating.toFixed(1)} ({ratingsCount || 0})
              </span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-book-700 mt-2 line-clamp-2">
              {description.replace(/<[^>]*>/g, '')}
            </p>
          )}

          {/* Action Buttons */}
          {showActions && isAuthenticated && (
            <div className="flex flex-wrap gap-2 mt-3">
              {!removeFromCollection ? (
                <>
                  <button
                    onClick={() => handleAddToList('favorites')}
                    className="flex items-center space-x-1 text-xs btn-outline hover:bg-red-50 hover:border-red-300 hover:text-red-700 whitespace-nowrap"
                    title="Add to Favorites"
                  >
                    <Heart className="w-3 h-3" />
                    <span>Favorite</span>
                  </button>
                  
                  <button
                    onClick={() => handleAddToList('read')}
                    className="flex items-center space-x-1 text-xs btn-outline hover:bg-green-50 hover:border-green-300 hover:text-green-700 whitespace-nowrap"
                    title="Mark as Read"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Read</span>
                  </button>
                  
                  <button
                    onClick={() => handleAddToList('wantToRead')}
                    className="flex items-center space-x-1 text-xs btn-outline hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 whitespace-nowrap"
                    title="Want to Read"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Want to Read</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleRemoveFromList(collectionType)}
                  className={`flex items-center space-x-1 text-xs btn-outline ${getRemoveButtonColor()} whitespace-nowrap`}
                  title={getRemoveButtonText()}
                >
                  <X className="w-3 h-3" />
                  <span>{getRemoveButtonText()}</span>
                </button>
              )}
            </div>
          )}

          {showActions && !isAuthenticated && (
            <div className="mt-3">
              <p className="text-xs text-book-500">
                <Link to="/login" className="text-primary-600 hover:text-primary-700">
                  Login
                </Link>{' '}
                to manage your book lists
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard; 