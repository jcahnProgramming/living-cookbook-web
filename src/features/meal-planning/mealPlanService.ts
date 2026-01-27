import { supabase } from '@/lib/supabase';

/**
 * Meal Planning Service
 * Handles meal plan and grocery list operations
 */

/**
 * Get or create meal plan for a specific week
 */
export async function getMealPlanForWeek(weekStartDate: string, userId: string) {
  try {
    // Try to get existing meal plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_items (
          *,
          recipe:recipes (*)
        )
      `)
      .eq('week_start_date', weekStartDate)
      .single();

    if (existingPlan) {
      return existingPlan;
    }

    // Create new meal plan if doesn't exist
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newPlan, error: createError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          week_start_date: weekStartDate,
        })
        .select(`
          *,
          meal_plan_items (
            *,
            recipe:recipes (*)
          )
        `)
        .single();

      if (createError) throw createError;
      return newPlan;
    }

    throw fetchError;
  } catch (error) {
    console.error('Failed to get meal plan:', error);
    throw error;
  }
}

/**
 * Add recipe to meal plan
 */
export async function addRecipeToMealPlan(
  mealPlanId: string,
  recipeId: string,
  plannedDate: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'dinner',
  servings: number = 1
) {
  try {
    const { data, error } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id: mealPlanId,
        recipe_id: recipeId,
        planned_date: plannedDate,
        meal_type: mealType,
        servings,
      })
      .select(`
        *,
        recipe:recipes (*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add recipe to meal plan:', error);
    throw error;
  }
}

/**
 * Remove recipe from meal plan
 */
export async function removeRecipeFromMealPlan(itemId: string) {
  try {
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to remove recipe from meal plan:', error);
    throw error;
  }
}

/**
 * Update meal plan item servings
 */
export async function updateMealPlanItemServings(itemId: string, servings: number) {
  try {
    const { data, error } = await supabase
      .from('meal_plan_items')
      .update({ servings })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to update servings:', error);
    throw error;
  }
}

/**
 * Copy last week's meal plan to current week
 */
export async function copyLastWeekMealPlan(
  userId: string,
  currentWeekStart: string,
  lastWeekStart: string
) {
  try {
    // Get last week's meal plan
    const { data: lastWeekPlan, error: fetchError } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('week_start_date', lastWeekStart)
      .single();

    if (fetchError || !lastWeekPlan) {
      throw new Error('No meal plan found for last week');
    }

    // Get last week's items
    const { data: lastWeekItems, error: itemsError } = await supabase
      .from('meal_plan_items')
      .select('*')
      .eq('meal_plan_id', lastWeekPlan.id);

    if (itemsError) throw itemsError;
    if (!lastWeekItems || lastWeekItems.length === 0) {
      throw new Error('No items in last week\'s meal plan');
    }

    // Get or create current week's meal plan
    const currentPlan = await getMealPlanForWeek(currentWeekStart, userId);

    // Copy items with updated dates (same day of week, new week)
    const newItems = lastWeekItems.map((item) => {
      const lastWeekDate = new Date(item.planned_date);
      const dayOfWeek = lastWeekDate.getDay();
      const currentWeekDate = new Date(currentWeekStart);
      currentWeekDate.setDate(currentWeekDate.getDate() + dayOfWeek);

      return {
        meal_plan_id: currentPlan.id,
        recipe_id: item.recipe_id,
        planned_date: currentWeekDate.toISOString().split('T')[0],
        meal_type: item.meal_type,
        servings: item.servings,
        notes: item.notes,
      };
    });

    // Insert new items
    const { data, error: insertError } = await supabase
      .from('meal_plan_items')
      .insert(newItems)
      .select(`
        *,
        recipe:recipes (*)
      `);

    if (insertError) throw insertError;
    return data;
  } catch (error) {
    console.error('Failed to copy meal plan:', error);
    throw error;
  }
}

/**
 * Get week start date (Monday) for a given date
 */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Get dates for current week (Mon-Sun)
 */
export function getWeekDates(weekStart: string): Date[] {
  const dates: Date[] = [];
  const start = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get day name
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}
