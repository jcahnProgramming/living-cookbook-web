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
 * Supports both personal and household lists
 */
export async function generateGroceryListFromMealPlan(
  mealPlanId: string,
  userId: string,
  householdId?: string | null
) {
  try {
    // Get meal plan items with recipes AND ingredients for user-created recipes
    const { data: mealPlanItems, error: itemsError } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipe:recipes (
          *,
          ingredients:recipe_ingredients(*)
        )
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
        household_id: householdId || null,
        name: householdId ? 'Household Grocery List' : 'Weekly Grocery List',
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
 * Get active grocery list for user in specific context
 * Context can be personal (householdId = null) or household-specific
 * For household lists, we query by household_id (shared among all members)
 * For personal lists, we query by user_id
 */
/**
 * Get active grocery list for user in specific context
 * FALLBACK VERSION: Fetches checked_by user info separately to avoid relationship issues
 */
export async function getActiveGroceryList(userId: string, householdId?: string | null) {
  try {
    let query = supabase
      .from('grocery_lists')
      .select(`
        *,
        items:grocery_list_items (*)
      `)
      .eq('is_active', true);

    // Filter by context
    if (householdId) {
      // Household mode: Get the household's list (shared by all members)
      query = query.eq('household_id', householdId);
    } else {
      // Personal mode: Get user's personal list
      query = query.eq('user_id', userId).is('household_id', null);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // If we have a grocery list with items, fetch user info for checked items
    if (data && data.items) {
      // Get unique user IDs from checked items
      const userIds = [...new Set(
        data.items
          .filter((item: any) => item.checked_by_user_id)
          .map((item: any) => item.checked_by_user_id)
      )];

      if (userIds.length > 0) {
        // Fetch user info for all users who checked items
        console.log('📋 Fetching user info for IDs:', userIds);
        
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, display_name, email')
          .in('id', userIds);

        console.log('👥 Fetched users:', users);
        console.log('❌ Users error:', usersError);

        // Create a map of user_id -> user info
        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        
        console.log('🗺️ User map:', Array.from(userMap.entries()));

        // Attach user info to items
        data.items = data.items.map((item: any) => {
          const checkedByUser = item.checked_by_user_id ? userMap.get(item.checked_by_user_id) : null;
          console.log(`📦 Item "${item.name}":`, {
            checked_by_user_id: item.checked_by_user_id,
            found_user: checkedByUser
          });
          return {
            ...item,
            checked_by: checkedByUser,
          };
        });
      }
    }

    return data;
  } catch (error) {
    console.error('Failed to get grocery list:', error);
    throw error;
  }
}

/**
 * Toggle item checked status
 * Now tracks who checked the item and when
 */
export async function toggleGroceryItem(itemId: string, isChecked: boolean, userId?: string) {
  try {
    const updateData: any = { 
      is_checked: isChecked,
    };

    // If checking the item, record who and when
    if (isChecked && userId) {
      updateData.checked_by_user_id = userId;
      updateData.checked_at = new Date().toISOString();
    } else if (!isChecked) {
      // If unchecking, clear the tracking
      updateData.checked_by_user_id = null;
      updateData.checked_at = null;
    }

    const { data, error } = await supabase
      .from('grocery_list_items')
      .update(updateData)
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

    // Handle user-created recipes (with recipe_ingredients table)
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ingredient: any) => {
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
            category: ingredient.section || 'Other',
            recipe_ids: [recipe.id],
            notes: ingredient.notes,
          });
        }
      });
    }
    // Handle imported recipes (with grocery_list JSONB)
    else if (recipe.grocery_list?.sections) {
      recipe.grocery_list.sections.forEach((section: any) => {
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
    }
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
