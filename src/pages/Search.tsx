import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { universalSearch, getSuggestedUsers, getTrendingRecipes, type SearchResults } from '@/features/search/searchService';
import { useAuth } from '@/contexts/AuthContext';
import './Search.css';

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'recipes' | 'posts'>('all');

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      loadSuggestions();
    }
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchResults = await universalSearch(query, { limit: 50 });
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!user?.id) return;

    try {
      const [suggested, trending] = await Promise.all([
        getSuggestedUsers(user.id),
        getTrendingRecipes(),
      ]);
      setSuggestedUsers(suggested);
      setTrendingRecipes(trending);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  if (!query) {
    // Empty state - show suggestions
    return (
      <div className="search-page">
        <div className="search-header">
          <h1>Search</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              placeholder="Search users, recipes, posts..."
              autoFocus
              className="search-input-large"
            />
            <button type="submit" className="btn-search">
              🔍 Search
            </button>
          </form>
        </div>

        {/* Suggested Users */}
        {suggestedUsers.length > 0 && (
          <section className="search-section">
            <h2>Suggested People</h2>
            <div className="suggestions-grid">
              {suggestedUsers.map((result) => (
                <Link
                  key={result.id}
                  to={result.url}
                  className="suggestion-card"
                >
                  {result.image && (
                    <img src={result.image} alt={result.title} className="suggestion-image" />
                  )}
                  <div className="suggestion-name">{result.title}</div>
                  {result.subtitle && (
                    <div className="suggestion-bio">{result.subtitle}</div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Recipes */}
        {trendingRecipes.length > 0 && (
          <section className="search-section">
            <h2>Trending Recipes</h2>
            <div className="suggestions-grid">
              {trendingRecipes.map((result) => (
                <Link
                  key={result.id}
                  to={result.url}
                  className="suggestion-card"
                >
                  {result.image && (
                    <img src={result.image} alt={result.title} className="suggestion-image" />
                  )}
                  <div className="suggestion-name">{result.title}</div>
                  {result.subtitle && (
                    <div className="suggestion-bio">{result.subtitle}</div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Search results view
  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search users, recipes, posts..."
            className="search-input-large"
          />
          <button type="submit" className="btn-search">
            🔍 Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner">⚙️</div>
          <p>Searching...</p>
        </div>
      ) : results ? (
        <>
          {/* Tabs */}
          <div className="search-tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
            >
              All ({results.total})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
            >
              Users ({results.users.length})
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`search-tab ${activeTab === 'recipes' ? 'active' : ''}`}
            >
              Recipes ({results.recipes.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
            >
              Posts ({results.posts.length})
            </button>
          </div>

          {/* Results */}
          <div className="search-results">
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <section className="results-section">
                <h2>Users</h2>
                <div className="results-list">
                  {results.users.map((result) => (
                    <Link key={result.id} to={result.url} className="result-card">
                      {result.image && (
                        <img src={result.image} alt={result.title} className="result-image" />
                      )}
                      <div className="result-content">
                        <div className="result-title">{result.title}</div>
                        {result.subtitle && (
                          <div className="result-subtitle">{result.subtitle}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'recipes') && results.recipes.length > 0 && (
              <section className="results-section">
                <h2>Recipes</h2>
                <div className="results-list">
                  {results.recipes.map((result) => (
                    <Link key={result.id} to={result.url} className="result-card">
                      {result.image && (
                        <img src={result.image} alt={result.title} className="result-image" />
                      )}
                      <div className="result-content">
                        <div className="result-title">{result.title}</div>
                        {result.subtitle && (
                          <div className="result-subtitle">{result.subtitle}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <section className="results-section">
                <h2>Posts</h2>
                <div className="results-list">
                  {results.posts.map((result) => (
                    <Link key={result.id} to={result.url} className="result-card">
                      {result.image && (
                        <img src={result.image} alt={result.title} className="result-image" />
                      )}
                      <div className="result-content">
                        <div className="result-title">{result.title}</div>
                        {result.subtitle && (
                          <div className="result-subtitle">{result.subtitle}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.total === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h2>No results found</h2>
                <p>Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SearchPage;
