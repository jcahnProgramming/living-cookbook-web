import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFavoriteRecipes } from '@/features/recipes/favoritesService';
import RecipeCard from '@/features/recipes/components/RecipeCard';
import './Favorites.css';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getFavoriteRecipes(user.id);
      setRecipes(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>My Favorites</h1>
          <p>Your saved recipes</p>
        </div>
        <div className="favorites-loading">
          <div className="loading-spinner">❤️</div>
          <p>Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>My Favorites</h1>
        </div>
        <div className="favorites-error">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={loadFavorites} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>My Favorites</h1>
          <p>Your saved recipes</p>
        </div>
        <div className="favorites-empty">
          <div className="empty-icon">💔</div>
          <h2>No favorites yet</h2>
          <p>Start exploring recipes and save your favorites!</p>
          <a href="/library" className="btn-browse">
            Browse Recipes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>My Favorites</h1>
        <p>{recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="favorites-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
