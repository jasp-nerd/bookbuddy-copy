import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookAPI } from '../services/api';
import SearchBar from '../components/common/SearchBar';
import BookCard from '../components/books/BookCard';
import { Search, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    query: '',
    filters: { orderBy: 'relevance', lang: '' }
  });

  // Initialize search from location state or URL params
  useEffect(() => {
    if (location.state?.query) {
      setSearchParams({
        query: location.state.query,
        filters: location.state.filters || { orderBy: 'relevance', lang: '' }
      });
    } else {
      // Try to get from URL params
      const urlParams = new URLSearchParams(location.search);
      const query = urlParams.get('q');
      if (query) {
        setSearchParams({
          query,
          filters: {
            orderBy: urlParams.get('order_by') || 'relevance',
            lang: urlParams.get('lang') || ''
          }
        });
      }
    }
  }, [location]);

  // Search query
  const { data: searchResults, isLoading, error } = useQuery(
    ['search', searchParams.query, currentPage, searchParams.filters],
    () => bookAPI.searchBooks(
      searchParams.query,
      currentPage,
      searchParams.filters.orderBy,
      searchParams.filters.lang
    ),
    {
      enabled: !!searchParams.query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (query, filters) => {
    setSearchParams({ query, filters });
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    params.set('q', query);
    if (filters.orderBy !== 'relevance') params.set('order_by', filters.orderBy);
    if (filters.lang) params.set('lang', filters.lang);
    
    navigate(`/search?${params.toString()}`, { 
      replace: true,
      state: { query, filters }
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to normalize search results
  const getNormalizedResults = (searchResults) => {
    if (Array.isArray(searchResults)) {
      return {
        items: searchResults,
        totalItems: searchResults.length,
      };
    } else if (searchResults && Array.isArray(searchResults.items)) {
      return {
        items: searchResults.items,
        totalItems: searchResults.totalItems || searchResults.items.length,
      };
    } else {
      return { items: [], totalItems: 0 };
    }
  };

  const normalized = getNormalizedResults(searchResults);
  const totalPages = Math.ceil((normalized.totalItems || 0) / 10);
  const hasResults = normalized.items && normalized.items.length > 0;

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Search className="w-6 h-6 text-primary-600" />
          <h1 className="text-3xl font-bold text-book-900">Search Books</h1>
        </div>
        
        <SearchBar 
          onSearch={handleSearch} 
          initialQuery={searchParams.query}
        />
      </div>

      {/* Search Results */}
      {searchParams.query && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <p className="text-book-600">Searching...</p>
              ) : hasResults ? (
                <p className="text-book-600">
                  Found {normalized.totalItems} results for "{searchParams.query}"
                </p>
              ) : (
                <p className="text-book-600">No results found for "{searchParams.query}"</p>
              )}
            </div>
            
            {hasResults && (
              <div className="text-sm text-book-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="ml-2 text-book-600">Searching for books...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Error searching for books</p>
              <p className="text-book-500 text-sm">{error.message}</p>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && !error && hasResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {normalized.items.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-book-600 bg-white border border-book-300 rounded-lg hover:bg-book-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'text-book-600 bg-white border border-book-300 hover:bg-book-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-book-600 bg-white border border-book-300 rounded-lg hover:bg-book-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && !hasResults && searchParams.query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-book-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-book-900 mb-2">
                No books found
              </h3>
              <p className="text-book-600 mb-4">
                We couldn't find any books matching "{searchParams.query}"
              </p>
              <div className="space-y-2 text-sm text-book-500">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Checking your spelling</li>
                  <li>Using different keywords</li>
                  <li>Searching for a broader topic</li>
                  <li>Removing filters</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searchParams.query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-book-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-book-900 mb-2">
            Start Your Search
          </h3>
          <p className="text-book-600">
            Enter a book title, author, or topic to find your next great read
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 