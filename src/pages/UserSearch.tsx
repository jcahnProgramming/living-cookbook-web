import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers, type UserProfile } from '@/features/users/userProfileService';
import './UserSearch.css';

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const users = await searchUsers(query.trim());
      setResults(users);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="user-search-page">
      <div className="search-header">
        <h1>Find People</h1>
        <p>Discover cooks and food lovers</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="search-input"
          />
          <button 
            type="submit" 
            className="btn-search"
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>
      </form>

      {hasSearched && (
        <div className="search-results">
          {results.length > 0 ? (
            <>
              <div className="results-header">
                Found {results.length} {results.length === 1 ? 'person' : 'people'}
              </div>
              <div className="users-grid">
                {results.map((user) => (
                  <Link 
                    key={user.id} 
                    to={`/profile/${user.id}`}
                    className="user-card"
                  >
                    <div className="user-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.display_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h3 className="user-name">{user.display_name}</h3>
                      {user.bio && (
                        <p className="user-bio">{user.bio.substring(0, 80)}{user.bio.length > 80 ? '...' : ''}</p>
                      )}
                      {user.location && (
                        <div className="user-location">📍 {user.location}</div>
                      )}
                      <div className="user-stats">
                        <span>{user.recipes_created || 0} recipes</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No users found</h3>
              <p>Try searching for a different name</p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="search-placeholder">
          <div className="placeholder-icon">👥</div>
          <h3>Search for people</h3>
          <p>Enter a name to find cooks and food lovers</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
