import { supabase } from '@/lib/supabase';

/**
 * Grocery List Service
 * Handles grocery list generation and management
 */

export interface AggregatedItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  recipe_ids: string[];
  notes?: string;
}

/**
 * Generate grocery list from meal plan
 */
export async function generateGroceryListFromMealPlan(
  mealPlanId: string,
  userId: string
) {
  try {
    // Get meal plan items with recipes
    const { data: mealPlanItems, error: itemsError } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipe:recipes (*)
      `)
      .eq('meal_plan_id', mealPlanId);

    if (itemsError) throw itemsError;
    if (!mealPlanItems || mealPlanItems.length === 0) {
      throw new Error('No recipes in meal plan');
    }

    // Aggregate ingredients
    const aggregated = aggregateIngredients(mealPlanItems);

    // Create grocery list
    const { data: groceryList, error: listError } = await supabase
      .from('grocery_lists')
      .insert({
        user_id: userId,
        meal_plan_id: mealPlanId,
        name: 'Weekly Grocery List',
      })
      .select()
      .single();

    if (listError) throw listError;

    // Insert items
    const items = aggregated.map((item, index) => ({
      grocery_list_id: groceryList.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      recipe_ids: item.recipe_ids,
      sort_order: index,
    }));

    const { data: insertedItems, error: itemsInsertError } = await supabase
      .from('grocery_list_items')
      .insert(items)
      .select();

    if (itemsInsertError) throw itemsInsertError;

    return {
      ...groceryList,
      items: insertedItems,
    };
  } catch (error) {
    console.error('Failed to generate grocery list:', error);
    throw error;
  }
}

/**
 * Get active grocery list for user
 */
export async function getActiveGroceryList(userId: string) {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select(`
        *,
        items:grocery_list_items (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Failed to get grocery list:', error);
    throw error;
  }
}

/**
 * Toggle item checked status
 */
export async function toggleGroceryItem(itemId: string, isChecked: boolean) {
  try {
    const { data, error } = await supabase
      .from('grocery_list_items')
      .update({ is_checked: isChecked })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to toggle item:', error);
    throw error;
  }
}

/**
 * Add custom item to grocery list
 */
export async function addCustomGroceryItem(
  groceryListId: string,
  name: string,
  category: string = 'Other'
) {
  try {
    const { data, error } = await supabase
      .from('grocery_list_items')
      .insert({
        grocery_list_id: groceryListId,
        name,
        category,
        recipe_ids: [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add item:', error);
    throw error;
  }
}

/**
 * Delete grocery list item
 */
export async function deleteGroceryItem(itemId: string) {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}

/**
 * Clear all checked items
 */
export async function clearCheckedItems(groceryListId: string) {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('grocery_list_id', groceryListId)
      .eq('is_checked', true);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to clear checked items:', error);
    throw error;
  }
}

/**
 * Aggregate ingredients from meal plan items
 */
function aggregateIngredients(mealPlanItems: any[]): AggregatedItem[] {
  const itemsMap = new Map<string, AggregatedItem>();

  mealPlanItems.forEach((mealPlanItem) => {
    const recipe = mealPlanItem.recipe;
    const servingsMultiplier = mealPlanItem.servings / (recipe.yield_servings || 1);

    // Process each grocery list section
    recipe.grocery_list?.sections?.forEach((section: any) => {
      const category = section.name || 'Other';

      section.items?.forEach((ingredient: any) => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit || 'none'}`;

        if (itemsMap.has(key)) {
          const existing = itemsMap.get(key)!;
          
          // Aggregate quantities
          if (ingredient.quantity && existing.quantity !== null) {
            existing.quantity += ingredient.quantity * servingsMultiplier;
          }
          
          // Add recipe ID
          if (!existing.recipe_ids.includes(recipe.id)) {
            existing.recipe_ids.push(recipe.id);
          }
        } else {
          itemsMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity
              ? ingredient.quantity * servingsMultiplier
              : null,
            unit: ingredient.unit || null,
            category,
            recipe_ids: [recipe.id],
            notes: ingredient.notes,
          });
        }
      });
    });
  });

  // Convert map to array and sort by category
  return Array.from(itemsMap.values()).sort((a, b) => {
    const categoryOrder = ['Proteins', 'Produce', 'Pantry / Condiments', 'Other'];
    const aIndex = categoryOrder.indexOf(a.category);
    const bIndex = categoryOrder.indexOf(b.category);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

/**
 * Format quantity for display
 */
export function formatQuantity(quantity: number | null, unit: string | null): string {
  if (quantity === null) return '';
  
  // Round to reasonable precision
  const rounded = Math.round(quantity * 100) / 100;
  
  // Convert decimals to fractions for common cases
  const fractionMap: { [key: number]: string } = {
    0.25: '¼',
    0.33: '⅓',
    0.5: '½',
    0.66: '⅔',
    0.75: '¾',
  };

  const decimal = rounded % 1;
  const whole = Math.floor(rounded);
  const fraction = fractionMap[Math.round(decimal * 100) / 100];

  if (whole === 0 && fraction) {
    return `${fraction} ${unit || ''}`.trim();
  } else if (whole > 0 && fraction) {
    return `${whole} ${fraction} ${unit || ''}`.trim();
  } else {
    return `${rounded} ${unit || ''}`.trim();
  }
}
