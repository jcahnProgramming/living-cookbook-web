import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRecipeById } from '@/features/recipes/recipeService';
import { formatTime, getDifficultyColor, getSpiceEmoji } from '@/features/recipes/recipeService';
import RecipeReactions from '@/features/recipes/components/RecipeReactions';
import { isFavorited, toggleFavorite } from '@/features/recipes/favoritesService';
import type { Recipe } from '@/types';
import './RecipeDetail.css';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    if (id) {
      loadRecipe(id);
    }
  }, [id]);

  const loadRecipe = async (recipeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRecipeById(recipeId);
      setRecipe(data);
      
      // Check if favorited
      if (user?.id) {
        const favorited = await isFavorited(recipeId, user.id);
        setIsFavorite(favorited);
      }
    } catch (err) {
      console.error('Failed to load recipe:', err);
      setError('Failed to load recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { deleteUserRecipe } = await import('@/features/recipes/userRecipeService');
      await deleteUserRecipe(recipe!.id, user!.id);
      navigate('/library');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user?.id) {
      alert('Please sign in to save favorites');
      return;
    }

    if (!recipe?.id) return;

    setIsFavoriting(true);
    try {
      const newStatus = await toggleFavorite(recipe.id, user.id);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorites. Please try again.');
    } finally {
      setIsFavoriting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-loading">
          <div className="loading-spinner">🍳</div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-error">
          <div className="error-icon">⚠️</div>
          <h2>Recipe not found</h2>
          <p>{error || 'This recipe does not exist.'}</p>
          <Link to="/library" className="btn-back">
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const totalTime = recipe.total_time_estimate_sec || recipe.time?.total_time_estimate_sec || 0;
  const servings = recipe.yield_servings ?? recipe.yield?.servings ?? 0;
  const units = recipe.yield_units ?? recipe.yield?.units ?? 'servings';
  const difficultyColor = getDifficultyColor(recipe.difficulty);
  const spiceEmoji = getSpiceEmoji(recipe.spice_level);

  // Check if this is a user-created recipe
  const isUserRecipe = (recipe as any).is_user_created && (recipe as any).user_id === user?.id;

  return (
    <div className="recipe-detail-page">
      {/* Header */}
      <div className="recipe-detail-header">
        <button onClick={() => navigate(-1)} className="btn-back-arrow">
          ← Back
        </button>
        
        {/* Edit & Delete buttons for user recipes */}
        {isUserRecipe && (
          <div className="recipe-actions">
            <Link to={`/recipe/edit/${recipe.id}`} className="btn-edit-recipe">
              ✏️ Edit Recipe
            </Link>
            <button 
              onClick={handleDelete} 
              className="btn-delete-recipe"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="recipe-hero">
        <div className="recipe-hero-image">
          {recipe.images?.hero?.url ? (
            <img src={recipe.images.hero.url} alt={recipe.title} />
          ) : (
            <div className="recipe-hero-placeholder">
              <span className="hero-placeholder-icon">🍽️</span>
            </div>
          )}
        </div>

        <div className="recipe-hero-content">
          <h1 className="recipe-title">{recipe.title}</h1>
          
          {recipe.subtitle && (
            <p className="recipe-subtitle">{recipe.subtitle}</p>
          )}

          <div className="recipe-meta">
            <div className="recipe-meta-item">
              <span className="meta-icon">⏱️</span>
              <div>
                <div className="meta-label">Total Time</div>
                <div className="meta-value">{formatTime(totalTime)}</div>
              </div>
            </div>

            <div className="recipe-meta-item">
              <span className="meta-icon">👥</span>
              <div>
                <div className="meta-label">Servings</div>
                <div className="meta-value">{servings} {units}</div>
              </div>
            </div>

            <div className="recipe-meta-item">
              <span className="meta-icon">📊</span>
              <div>
                <div className="meta-label">Difficulty</div>
                <div 
                  className="meta-value"
                  style={{ color: difficultyColor, fontWeight: 600 }}
                >
                  {recipe.difficulty}
                </div>
              </div>
            </div>

            {spiceEmoji && (
              <div className="recipe-meta-item">
                <span className="meta-icon">{spiceEmoji}</span>
                <div>
                  <div className="meta-label">Spice Level</div>
                  <div className="meta-value">{recipe.spice_level}</div>
                </div>
              </div>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="recipe-tags-section">
              {recipe.tags.map((tag) => (
                <span key={tag} className="recipe-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="recipe-actions">
            <Link to={`/cooking/${recipe.id}`} className="btn-primary btn-cook">
              🍳 Start Cooking
            </Link>
            <button 
              onClick={handleToggleFavorite}
              disabled={isFavoriting}
              className={`btn-secondary ${isFavorite ? 'btn-favorited' : ''}`}
            >
              {isFavorite ? '💖 Saved' : '❤️ Save to Favorites'}
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Reactions */}
      <RecipeReactions recipeId={recipe.id} />

      {/* Content Section */}
      <div className="recipe-content">
        {/* Ingredients */}
        <div className="recipe-section">
          <h2 className="section-title">📝 Ingredients</h2>
          
          {/* User-created recipe ingredients */}
          {(recipe as any).ingredients && (recipe as any).ingredients.length > 0 ? (
            <div className="ingredient-section">
              <ul className="ingredient-list">
                {(recipe as any).ingredients.map((ingredient: any) => (
                  <li key={ingredient.id} className="ingredient-item">
                    <span className="ingredient-amount">
                      {ingredient.quantity && `${ingredient.quantity} `}
                      {ingredient.unit && `${ingredient.unit} `}
                    </span>
                    <span className="ingredient-name">{ingredient.name}</span>
                    {ingredient.notes && (
                      <span className="ingredient-notes"> ({ingredient.notes})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* Standard recipe ingredients */
            recipe.grocery_list?.sections?.map((section, idx) => (
              <div key={idx} className="ingredient-section">
                <h3 className="ingredient-section-title">{section.name}</h3>
                <ul className="ingredient-list">
                  {section.items?.map((item, itemIdx) => (
                    <li key={itemIdx} className="ingredient-item">
                      <span className="ingredient-name">{item.name}</span>
                      {(item.quantity || item.unit) && (
                        <span className="ingredient-amount">
                          {item.quantity && `${item.quantity} `}
                          {item.unit}
                        </span>
                      )}
                      {item.notes && (
                        <span className="ingredient-notes">({item.notes})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="recipe-section">
          <h2 className="section-title">👨‍🍳 Instructions</h2>
          
          {/* User-created recipe steps */}
          {(recipe as any).steps && (recipe as any).steps.length > 0 ? (
            <div className="instructions-list">
              {(recipe as any).steps.map((step: any) => (
                <div key={step.id} className="instruction-step">
                  <div className="step-number">{step.step_number}</div>
                  <div className="step-content">
                    <p className="step-summary">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Standard recipe steps */
            recipe.cooking_countdown_schedule?.steps && 
            recipe.cooking_countdown_schedule.steps.length > 0 ? (
              <div className="instructions-list">
                {recipe.cooking_countdown_schedule.steps.map((step, idx) => (
                  <div key={step.step_id || idx} className="instruction-step">
                    <div className="step-number">{step.step_number}</div>
                    <div className="step-content">
                      <h4 className="step-title">{step.title}</h4>
                      <p className="step-summary">{step.summary}</p>
                    
                    {step.instructions && step.instructions.length > 0 && (
                      <ul className="step-instructions">
                        {step.instructions.map((instruction, iIdx) => (
                          <li key={iIdx}>{instruction}</li>
                        ))}
                      </ul>
                    )}

                    {step.timers && step.timers.length > 0 && (
                      <div className="step-timers">
                        {step.timers.map((timer, tIdx) => (
                          <div key={tIdx} className="timer-badge">
                            ⏲️ {timer.label}: {formatTime(timer.duration_sec)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="no-instructions">
                Detailed cooking instructions will be added soon.
              </p>
            )
          )}
        </div>

        {/* Plating & Serving */}
        {((recipe as any).plating_notes || 
          (recipe.plating_recommendations?.items && recipe.plating_recommendations.items.length > 0)) && (
          <div className="recipe-section">
            <h2 className="section-title">🍽️ Plating & Serving</h2>
            
            {/* User recipe plating notes */}
            {(recipe as any).plating_notes && (
              <div className="plating-notes">
                <p>{(recipe as any).plating_notes}</p>
              </div>
            )}

            {/* Standard recipe plating */}
            {recipe.plating_recommendations?.items && recipe.plating_recommendations.items.length > 0 && (
              <div className="plating-recommendations">
                {recipe.plating_recommendations.items.map((plating, idx) => (
                  <div key={idx} className="plating-item">
                    <h4 className="plating-title">{plating.title}</h4>
                    <p className="plating-text">{plating.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="recipe-section">
          <h2 className="section-title">📔 Personal Notes</h2>
          <div className="notes-section">
            <textarea
              className="notes-textarea"
              placeholder="Add your personal notes, modifications, or tips here..."
              rows={4}
            />
            <button className="btn-save-notes">Save Notes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
