import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRecipes } from '@/features/recipes/recipeService';
import { getFavoriteRecipes } from '@/features/recipes/favoritesService';
import RecipeCard from '@/features/recipes/components/RecipeCard';
import type { Recipe } from '@/types';
import './Library.css';

// Common recipe tags for filtering
const RECIPE_TAGS = {
  dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'],
  cuisine: ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 'Indian'],
  mealType: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'],
  cookingTime: ['Quick (< 30 min)', 'Medium (30-60 min)', 'Long (> 60 min)'],
};

const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allRecipes, showFavoritesOnly, selectedTags]);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRecipes();
      setAllRecipes(data);
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setError('Failed to load recipes. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...allRecipes];

    // Filter by favorites
    if (showFavoritesOnly && user?.id) {
      try {
        const favorites = await getFavoriteRecipes(user.id);
        const favoriteIds = new Set(favorites.map((f: any) => f.id));
        filtered = filtered.filter(recipe => favoriteIds.has(recipe.id));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(recipe => {
        if (!recipe.tags || recipe.tags.length === 0) return false;
        // Recipe must have at least one of the selected tags
        return selectedTags.some(tag => recipe.tags?.includes(tag));
      });
    }

    setFilteredRecipes(filtered);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setShowFavoritesOnly(false);
    setSelectedTags([]);
  };

  const activeFilterCount = (showFavoritesOnly ? 1 : 0) + selectedTags.length;

  if (isLoading) {
    return (
      <div className="library-page">
        <div className="library-header">
          <h1>Recipe Library</h1>
          <p>Browse your collection of delicious recipes</p>
        </div>
        <div className="library-loading">
          <div className="loading-spinner">🍳</div>
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-page">
        <div className="library-header">
          <h1>Recipe Library</h1>
        </div>
        <div className="library-error">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={loadRecipes} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (allRecipes.length === 0) {
    return (
      <div className="library-page">
        <div className="library-header">
          <h1>Recipe Library</h1>
        </div>
        <div className="library-empty">
          <div className="empty-icon">📚</div>
          <h2>No recipes yet</h2>
          <p>Start by adding your first recipe!</p>
          <Link to="/recipe/create" className="btn-create-recipe">
            ✨ Create Recipe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <h1>Recipe Library</h1>
          <p>
            Showing {filteredRecipes.length} of {allRecipes.length} recipe
            {allRecipes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/recipe/create" className="btn-create-recipe">
          ✨ Create Recipe
        </Link>
      </div>

      {/* Filters */}
      <div className="library-filters">
        <div className="filter-header">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-toggle-filters"
          >
            🔍 Filters
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="btn-clear-filters">
              Clear All
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-panel">
            {/* Favorites Toggle */}
            <div className="filter-group">
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                />
                <span className="toggle-label">❤️ Show Favorites Only</span>
              </label>
            </div>

            {/* Dietary Tags */}
            <div className="filter-group">
              <h3 className="filter-group-title">Dietary</h3>
              <div className="filter-tags">
                {RECIPE_TAGS.dietary.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Tags */}
            <div className="filter-group">
              <h3 className="filter-group-title">Cuisine</h3>
              <div className="filter-tags">
                {RECIPE_TAGS.cuisine.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Type Tags */}
            <div className="filter-group">
              <h3 className="filter-group-title">Meal Type</h3>
              <div className="filter-tags">
                {RECIPE_TAGS.mealType.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time Tags */}
            <div className="filter-group">
              <h3 className="filter-group-title">Cooking Time</h3>
              <div className="filter-tags">
                {RECIPE_TAGS.cookingTime.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="library-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="library-no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No recipes match your filters</h3>
          <p>Try adjusting your filters or clear them to see all recipes</p>
          <button onClick={clearFilters} className="btn-clear-filters">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
