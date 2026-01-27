import React from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '@/types';
import { formatTime, getDifficultyColor, getSpiceEmoji } from '../recipeService';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  // Handle both nested and flat time structures from database
  const totalTime = typeof recipe.time === 'object' 
    ? recipe.time.total_time_estimate_sec 
    : recipe.total_time_estimate_sec || 0;
  
  // Handle both nested and flat yield structures from database
  const servings = recipe.yield?.servings ?? recipe.yield_servings ?? 0;
  const units = recipe.yield?.units ?? recipe.yield_units ?? 'servings';
  
  const timeStr = formatTime(totalTime);
  const difficultyColor = getDifficultyColor(recipe.difficulty);
  const spiceEmoji = getSpiceEmoji(recipe.spice_level);

  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-image">
        {recipe.images?.hero?.url ? (
          <img src={recipe.images.hero.url} alt={recipe.images.hero.alt || recipe.title} />
        ) : (
          <div className="recipe-card-placeholder">
            <span className="recipe-card-placeholder-icon">🍽️</span>
          </div>
        )}
      </div>

      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        
        {recipe.subtitle && (
          <p className="recipe-card-subtitle">{recipe.subtitle}</p>
        )}

        <div className="recipe-card-badges">
          <span className="recipe-badge recipe-badge-time">
            ⏱️ {timeStr}
          </span>
          
          <span className="recipe-badge recipe-badge-servings">
            👥 {servings} {units}
          </span>
          
          <span 
            className="recipe-badge recipe-badge-difficulty"
            style={{ backgroundColor: difficultyColor }}
          >
            {recipe.difficulty}
          </span>

          {spiceEmoji && (
            <span className="recipe-badge recipe-badge-spice">
              {spiceEmoji}
            </span>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="recipe-tag">
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="recipe-tag-more">+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;
