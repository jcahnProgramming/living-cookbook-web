import React from 'react';
import './MealPlanActivity.css';

interface MealPlanActivityProps {
  mealPlan: any;
  householdMembers?: any[];
}

/**
 * Simple activity indicator showing how many recipes are in the plan
 * Future: Could expand to show full activity feed with timestamps
 */
const MealPlanActivity: React.FC<MealPlanActivityProps> = ({ mealPlan }) => {
  if (!mealPlan || !mealPlan.meal_plan_items) return null;

  const totalRecipes = mealPlan.meal_plan_items.length;

  if (totalRecipes === 0) {
    return (
      <div className="meal-plan-activity">
        <div className="activity-empty">
          📋 No recipes added yet - start planning your week!
        </div>
      </div>
    );
  }

  return (
    <div className="meal-plan-activity">
      <div className="activity-summary">
        🍽️ <strong>{totalRecipes}</strong> {totalRecipes === 1 ? 'recipe' : 'recipes'} planned this week
      </div>
    </div>
  );
};

export default MealPlanActivity;
