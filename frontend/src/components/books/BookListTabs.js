import React from 'react';

const BookListTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-book-200 mb-4">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === tab.id
                ? `${tab.borderColor} ${tab.color}`
                : 'border-transparent text-book-500 hover:text-book-700 hover:border-book-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-5 h-5" />}
            <span>{tab.name}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeTab === tab.id ? 'bg-white' : 'bg-book-100'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BookListTabs; 