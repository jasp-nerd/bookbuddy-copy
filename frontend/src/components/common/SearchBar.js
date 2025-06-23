import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const SearchBar = ({ onSearch, initialQuery = '', className = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orderBy: 'relevance',
    lang: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query.trim(), newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = { orderBy: 'relevance', lang: '' };
    setFilters(clearedFilters);
    if (query.trim()) {
      onSearch(query.trim(), clearedFilters);
    }
  };

  const hasActiveFilters = filters.orderBy !== 'relevance' || filters.lang !== '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-book-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books, authors, or topics..."
            className="w-full pl-10 pr-4 py-3 input-field text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-book-600 hover:text-book-900 transition-colors duration-200"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-xs text-book-500 hover:text-book-700 transition-colors duration-200"
          >
            <X className="w-3 h-3" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-book-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-book-700 mb-2">
                Sort by
              </label>
              <select
                value={filters.orderBy}
                onChange={(e) => handleFilterChange('orderBy', e.target.value)}
                className="input-field"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-book-700 mb-2">
                Language
              </label>
              <select
                value={filters.lang}
                onChange={(e) => handleFilterChange('lang', e.target.value)}
                className="input-field"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-book-200">
              {filters.orderBy !== 'relevance' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  Sort: {filters.orderBy === 'newest' ? 'Newest' : 'Relevance'}
                </span>
              )}
              {filters.lang && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  Language: {filters.lang.toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 