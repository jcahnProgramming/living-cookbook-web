import React, { useEffect, useState } from 'react';
import { getRecipes } from '@/features/recipes/recipeService';
import RecipeCard from '@/features/recipes/components/RecipeCard';
import type { Recipe } from '@/types';
import './Library.css';

const LibraryPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setError('Failed to load recipes. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (recipes.length === 0) {
    return (
      <div className="library-page">
        <div className="library-header">
          <h1>Recipe Library</h1>
        </div>
        <div className="library-empty">
          <div className="empty-icon">📚</div>
          <h2>No recipes yet</h2>
          <p>Start by adding your first recipe!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Recipe Library</h1>
        <p>Browse {recipes.length} delicious recipe{recipes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="library-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;
