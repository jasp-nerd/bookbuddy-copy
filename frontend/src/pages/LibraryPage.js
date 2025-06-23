import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useUser } from '../context/UserContext';
import { userListsAPI } from '../services/api';
import BookCard from '../components/books/BookCard';
import { Heart, BookOpen, Clock, Loader, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const LibraryPage = () => {
  const { currentUser, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('favorites');

  // Fetch user's book lists
  const { data: favoriteBooks, isLoading: loadingFavorites } = useQuery(
    ['favoriteBooks', currentUser?.id],
    () => userListsAPI.getFavoriteBooks(currentUser.id),
    {
      enabled: !!currentUser?.id,
    }
  );

  const { data: readBooks, isLoading: loadingRead } = useQuery(
    ['readBooks', currentUser?.id],
    () => userListsAPI.getReadBooks(currentUser.id),
    {
      enabled: !!currentUser?.id,
    }
  );

  const { data: wantToReadBooks, isLoading: loadingWantToRead } = useQuery(
    ['wantToReadBooks', currentUser?.id],
    () => userListsAPI.getWantToReadBooks(currentUser.id),
    {
      enabled: !!currentUser?.id,
    }
  );

  const tabs = [
    {
      id: 'favorites',
      name: 'Favorites',
      icon: Heart,
      count: favoriteBooks?.length || 0,
      books: favoriteBooks,
      isLoading: loadingFavorites,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      id: 'read',
      name: 'Read',
      icon: BookOpen,
      count: readBooks?.length || 0,
      books: readBooks,
      isLoading: loadingRead,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'wantToRead',
      name: 'Want to Read',
      icon: Clock,
      count: wantToReadBooks?.length || 0,
      books: wantToReadBooks,
      isLoading: loadingWantToRead,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-book-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-book-900 mb-2">
          Your Personal Library
        </h2>
        <p className="text-book-600 mb-6">
          Sign in to manage your reading lists and track your favorite books
        </p>
        <Link
          to="/login"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Get Started</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-book-900">My Library</h1>
        <p className="text-book-600">
          Manage your reading lists and track your literary journey
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-book-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? `${tab.borderColor} ${tab.color}`
                    : 'border-transparent text-book-500 hover:text-book-700 hover:border-book-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isActive ? 'bg-white' : 'bg-book-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Tab Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {(() => {
              const Icon = activeTabData.icon;
              return <Icon className={`w-6 h-6 ${activeTabData.color}`} />;
            })()}
            <h2 className="text-2xl font-bold text-book-900">
              {activeTabData.name}
            </h2>
            <span className="text-sm text-book-500">
              ({activeTabData.count} books)
            </span>
          </div>
        </div>

        {/* Loading State */}
        {activeTabData.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="ml-2 text-book-600">Loading your {activeTabData.name.toLowerCase()}...</span>
          </div>
        )}

        {/* Empty State */}
        {!activeTabData.isLoading && (!activeTabData.books || activeTabData.books.length === 0) && (
          <div className={`text-center py-12 ${activeTabData.bgColor} rounded-lg border ${activeTabData.borderColor}`}>
            {(() => {
              const Icon = activeTabData.icon;
              return <Icon className={`w-16 h-16 ${activeTabData.color} mx-auto mb-4`} />;
            })()}
            <h3 className="text-xl font-semibold text-book-900 mb-2">
              No {activeTabData.name} Yet
            </h3>
            <p className="text-book-600 mb-4">
              {activeTabData.id === 'favorites' && "Start building your collection of favorite books"}
              {activeTabData.id === 'read' && "Track the books you've completed reading"}
              {activeTabData.id === 'wantToRead' && "Create a list of books you want to read next"}
            </p>
            <Link
              to="/search"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Discover Books</span>
            </Link>
          </div>
        )}

        {/* Books Grid */}
        {!activeTabData.isLoading && activeTabData.books && activeTabData.books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTabData.books.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                showActions={true}
                removeFromCollection={true}
                collectionType={activeTab}
                className={`${activeTabData.bgColor} border ${activeTabData.borderColor}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                className={`p-6 rounded-lg border ${tab.borderColor} ${tab.bgColor}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-8 h-8 ${tab.color}`} />
                  <div>
                    <p className="text-sm font-medium text-book-600">{tab.name}</p>
                    <p className="text-2xl font-bold text-book-900">{tab.count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryPage; 