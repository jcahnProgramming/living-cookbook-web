import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMealPlanForWeek,
  getWeekStart,
  getWeekDates,
  formatDate,
  getDayName,
  addRecipeToMealPlan,
  removeRecipeFromMealPlan,
} from '@/features/meal-planning/mealPlanService';
import { getRecipes } from '@/features/recipes/recipeService';
import type { Recipe } from '@/types';
import './Plan.css';

const PlanPage: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use a temporary user ID (Phase 3 will add real auth)
      const tempUserId = '00000000-0000-0000-0000-000000000001';
      
      const [planData, recipesData] = await Promise.all([
        getMealPlanForWeek(currentWeekStart, tempUserId),
        getRecipes(),
      ]);
      
      setMealPlan(planData);
      setRecipes(recipesData);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipe = async (recipeId: string) => {
    if (!selectedDate || !mealPlan) return;
    
    try {
      await addRecipeToMealPlan(mealPlan.id, recipeId, selectedDate);
      await loadData();
      setShowRecipePicker(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to add recipe:', error);
    }
  };

  const handleRemoveRecipe = async (itemId: string) => {
    try {
      await removeRecipeFromMealPlan(itemId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove recipe:', error);
    }
  };

  const openRecipePicker = (date: string) => {
    setSelectedDate(date);
    setShowRecipePicker(true);
  };

  const getRecipesForDate = (date: Date) => {
    if (!mealPlan?.meal_plan_items) return [];
    const dateStr = date.toISOString().split('T')[0];
    return mealPlan.meal_plan_items.filter(
      (item: any) => item.planned_date === dateStr
    );
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(getWeekStart(nextWeek));
  };

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(getWeekStart(prevWeek));
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  if (isLoading) {
    return (
      <div className="plan-page">
        <div className="plan-loading">
          <div className="loading-spinner">📅</div>
          <p>Loading meal plan...</p>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates(currentWeekStart);

  return (
    <div className="plan-page">
      {/* Header */}
      <div className="plan-header">
        <div>
          <h1>Meal Planner</h1>
          <p>Plan your weekly meals and generate grocery lists</p>
        </div>
        <Link to="/grocery" className="btn-grocery">
          🛒 View Grocery List
        </Link>
      </div>

      {/* Week Navigator */}
      <div className="week-navigator">
        <button onClick={goToPreviousWeek} className="btn-week-nav">
          ← Previous Week
        </button>
        <div className="week-display">
          <h2>{formatDate(weekDates[0])} - {formatDate(weekDates[6])}</h2>
          {currentWeekStart !== getWeekStart(new Date()) && (
            <button onClick={goToThisWeek} className="btn-this-week">
              Go to This Week
            </button>
          )}
        </div>
        <button onClick={goToNextWeek} className="btn-week-nav">
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {weekDates.map((date) => {
          const recipesForDay = getRecipesForDate(date);
          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div key={dateStr} className={`day-card ${isToday ? 'is-today' : ''}`}>
              <div className="day-header">
                <h3>{getDayName(date)}</h3>
                <span className="day-date">{date.getDate()}</span>
              </div>

              <div className="day-meals">
                {recipesForDay.length > 0 ? (
                  recipesForDay.map((item: any) => (
                    <div key={item.id} className="meal-item">
                      <div className="meal-content">
                        <Link to={`/recipe/${item.recipe_id}`} className="meal-title">
                          {item.recipe?.title || 'Unknown Recipe'}
                        </Link>
                        <div className="meal-meta">
                          <span className="meal-type">{item.meal_type}</span>
                          <span className="meal-servings">{item.servings}× servings</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRecipe(item.id)}
                        className="btn-remove-meal"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-meals">
                    <span className="no-meals-icon">🍽️</span>
                    <p>No meals planned</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => openRecipePicker(dateStr)}
                className="btn-add-meal"
              >
                + Add Meal
              </button>
            </div>
          );
        })}
      </div>

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
        <div className="modal-overlay" onClick={() => setShowRecipePicker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Recipe to {selectedDate && formatDate(new Date(selectedDate))}</h2>
              <button
                onClick={() => setShowRecipePicker(false)}
                className="btn-close-modal"
              >
                ✕
              </button>
            </div>

            <div className="recipe-picker-list">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-picker-item"
                  onClick={() => handleAddRecipe(recipe.id)}
                >
                  <div className="picker-item-content">
                    <h4>{recipe.title}</h4>
                    <p>{recipe.subtitle}</p>
                  </div>
                  <div className="picker-item-meta">
                    <span>⏱️ {Math.round((recipe.total_time_estimate_sec || 0) / 60)}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanPage;
