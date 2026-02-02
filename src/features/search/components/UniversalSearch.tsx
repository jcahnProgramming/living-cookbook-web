import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { universalSearch, type SearchResults, type SearchResult } from '@/features/search/searchService';
import './UniversalSearch.css';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const UniversalSearch: React.FC<Props> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'user' | 'recipe' | 'post'>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await universalSearch(
          query,
          activeFilter !== 'all' ? { type: activeFilter } : undefined
        );
        setResults(searchResults);
        console.log('Search results:', searchResults); // Debug log
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onToggle();
        setQuery('');
        setResults(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  // Keyboard shortcut (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onToggle();
      }

      if (event.key === 'Escape' && isOpen) {
        onToggle();
        setQuery('');
        setResults(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onToggle();
    setQuery('');
    setResults(null);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
  };

  const getFilteredResults = () => {
    if (!results) return [];

    if (activeFilter === 'all') {
      return [
        ...results.users,
        ...results.recipes,
        ...results.posts,
      ];
    } else if (activeFilter === 'user') {
      return results.users;
    } else if (activeFilter === 'recipe') {
      return results.recipes;
    } else {
      return results.posts;
    }
  };

  const filteredResults = getFilteredResults();

  if (!isOpen) return null;

  return (
    <div className="universal-search" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, recipes, posts..."
          className="search-input"
        />
        <kbd className="search-shortcut">⌘K</kbd>
      </div>

      {isOpen && query.trim() && (
        <div className="search-dropdown">
          {/* Filter Tabs */}
          <div className="search-filters">
            <button
              onClick={() => handleFilterChange('all')}
              className={`search-filter ${activeFilter === 'all' ? 'active' : ''}`}
            >
              All {results && `(${results.total})`}
            </button>
            <button
              onClick={() => handleFilterChange('user')}
              className={`search-filter ${activeFilter === 'user' ? 'active' : ''}`}
            >
              Users {results && `(${results.users.length})`}
            </button>
            <button
              onClick={() => handleFilterChange('recipe')}
              className={`search-filter ${activeFilter === 'recipe' ? 'active' : ''}`}
            >
              Recipes {results && `(${results.recipes.length})`}
            </button>
            <button
              onClick={() => handleFilterChange('post')}
              className={`search-filter ${activeFilter === 'post' ? 'active' : ''}`}
            >
              Posts {results && `(${results.posts.length})`}
            </button>
          </div>

          {/* Results */}
          <div className="search-results">
            {isLoading ? (
              <div className="search-loading">Searching...</div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="search-result-item"
                >
                  {result.image && (
                    <div className="result-image">
                      <img src={result.image} alt={result.title} />
                    </div>
                  )}
                  <div className="result-content">
                    <div className="result-type">{result.type}</div>
                    <div className="result-title">{result.title}</div>
                    {result.subtitle && (
                      <div className="result-subtitle">{result.subtitle}</div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="search-empty">
                <p>No results found for "{query}"</p>
                <span>Try different keywords</span>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredResults.length > 0 && (
            <div className="search-footer">
              <button
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  onToggle();
                  setQuery('');
                  setResults(null);
                }}
                className="btn-view-all"
              >
                View all results →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
