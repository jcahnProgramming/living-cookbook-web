import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/features/households/hooks/useHousehold';
import ContextSwitcher from '@/components/ContextSwitcher';
import { getMealPlanForWeek, getWeekStart } from '@/features/meal-planning/mealPlanService';
import {
  getActiveGroceryList,
  generateGroceryListFromMealPlan,
  toggleGroceryItem,
  addCustomGroceryItem,
  deleteGroceryItem,
  clearCheckedItems,
  formatQuantity,
} from '@/features/grocery/groceryService';
import './Grocery.css';

const GroceryPage: React.FC = () => {
  const { user } = useAuth();
  const { household } = useHousehold();
  
  const [mode, setMode] = useState<'personal' | 'household'>('personal');
  const [groceryList, setGroceryList] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  // Auto-switch to household mode if user has household
  useEffect(() => {
    if (household) {
      setMode('household');
    }
  }, [household]);

  useEffect(() => {
    if (user?.id) {
      loadGroceryList();
    }
  }, [user?.id, mode]);

  const loadGroceryList = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const householdId = mode === 'household' ? household?.id : null;
      const data = await getActiveGroceryList(user.id, householdId);
      setGroceryList(data);
    } catch (error) {
      console.error('Failed to load grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateList = async () => {
    if (!user?.id) return;
    
    try {
      setIsGenerating(true);
      
      const householdId = mode === 'household' ? household?.id : null;
      
      // Get current week's meal plan
      const weekStart = getWeekStart(new Date());
      
      console.log('=== GENERATING GROCERY LIST ===');
      console.log('Mode:', mode);
      console.log('Week start:', weekStart);
      console.log('User ID:', user.id);
      console.log('Household ID:', householdId);
      
      const mealPlan = await getMealPlanForWeek(weekStart, user.id, householdId);
      
      console.log('Meal plan returned:', mealPlan);
      console.log('Meal plan ID:', mealPlan?.id);
      console.log('Meal plan items:', mealPlan?.meal_plan_items);
      console.log('Number of items:', mealPlan?.meal_plan_items?.length);
      
      if (!mealPlan) {
        alert(`No meal plan found for this week in ${mode} mode. Add recipes to your meal plan first!`);
        return;
      }
      
      if (!mealPlan.meal_plan_items || mealPlan.meal_plan_items.length === 0) {
        alert(`No meals in your ${mode === 'household' ? 'household' : 'personal'} plan! Add some recipes first.`);
        return;
      }

      // Generate grocery list
      console.log('Generating grocery list from meal plan:', mealPlan.id);
      const newList = await generateGroceryListFromMealPlan(mealPlan.id, user.id, householdId);
      console.log('Generated list:', newList);
      
      setGroceryList(newList);
    } catch (error: any) {
      console.error('=== ERROR GENERATING GROCERY LIST ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      alert(`Failed to generate grocery list: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeChange = (newMode: 'personal' | 'household') => {
    setMode(newMode);
  };

  const handleToggleItem = async (itemId: string, currentState: boolean) => {
    if (!user?.id) return;
    
    try {
      await toggleGroceryItem(itemId, !currentState, user.id);
      await loadGroceryList();
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleAddCustomItem = async () => {
    if (!newItemName.trim() || !groceryList) return;
    
    try {
      await addCustomGroceryItem(groceryList.id, newItemName.trim());
      setNewItemName('');
      setShowAddItem(false);
      await loadGroceryList();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteGroceryItem(itemId);
      await loadGroceryList();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleClearChecked = async () => {
    if (!groceryList) return;
    
    const confirmed = window.confirm('Remove all checked items?');
    if (!confirmed) return;
    
    try {
      await clearCheckedItems(groceryList.id);
      await loadGroceryList();
    } catch (error) {
      console.error('Failed to clear checked items:', error);
    }
  };

  // Group items by category
  const groupedItems = groceryList?.items?.reduce((acc: any, item: any) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}) || {};

  const categories = Object.keys(groupedItems);
  const totalItems = groceryList?.items?.length || 0;
  const checkedItems = groceryList?.items?.filter((item: any) => item.is_checked).length || 0;

  if (isLoading) {
    return (
      <div className="grocery-page">
        <div className="grocery-loading">
          <div className="loading-spinner">🛒</div>
          <p>Loading grocery list...</p>
        </div>
      </div>
    );
  }

  if (!groceryList) {
    return (
      <div className="grocery-page">
        {/* Context Switcher in empty state */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <ContextSwitcher
            mode={mode}
            householdName={household?.name}
            onModeChange={handleModeChange}
            disabled={isLoading || isGenerating}
          />
        </div>

        {/* Context Indicator */}
        {mode === 'household' && household && (
          <div className="context-banner context-banner--household">
            <span className="context-banner-icon">🏠</span>
            <span className="context-banner-text">
              Viewing <strong>{household.name}</strong> grocery list - all household members can see and check items
            </span>
          </div>
        )}

        <div className="grocery-empty">
          <div className="empty-icon">🛒</div>
          <h2>No Grocery List Yet</h2>
          <p>Generate a grocery list from your {mode === 'household' ? 'household' : 'personal'} meal plan to get started!</p>
          <button
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="btn-generate"
          >
            {isGenerating ? 'Generating...' : '🪄 Generate from Meal Plan'}
          </button>
          <Link to="/plan" className="btn-link">
            Go to Meal Planner →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grocery-page">
      {/* Header */}
      <div className="grocery-header">
        <div>
          <h1>Grocery List</h1>
          <p className="grocery-stats">
            {checkedItems} of {totalItems} items checked
          </p>
        </div>
        <div className="grocery-header-actions">
          <ContextSwitcher
            mode={mode}
            householdName={household?.name}
            onModeChange={handleModeChange}
            disabled={isLoading || isGenerating}
          />
          <div className="grocery-actions">
            <button
              onClick={handleGenerateList}
              disabled={isGenerating}
              className="btn-regenerate"
            >
              {isGenerating ? 'Generating...' : '🔄 Regenerate'}
            </button>
            {checkedItems > 0 && (
              <button onClick={handleClearChecked} className="btn-clear">
                🗑️ Clear Checked
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Context Indicator */}
      {mode === 'household' && household && (
        <div className="context-banner context-banner--household">
          <span className="context-banner-icon">🏠</span>
          <span className="context-banner-text">
            Viewing <strong>{household.name}</strong> grocery list - all household members can check off items
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(checkedItems / totalItems) * 100}%` }}
        />
      </div>

      {/* Grocery List */}
      <div className="grocery-sections">
        {categories.map((category) => (
          <div key={category} className="grocery-section">
            <h3 className="section-title">{category}</h3>
            <div className="grocery-items">
              {groupedItems[category].map((item: any) => (
                <div
                  key={item.id}
                  className={`grocery-item ${item.is_checked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={item.is_checked}
                    onChange={() => handleToggleItem(item.id, item.is_checked)}
                    className="item-checkbox"
                  />
                  <div className="item-content">
                    <span className="item-name">{item.name}</span>
                    {(item.quantity || item.unit) && (
                      <span className="item-quantity">
                        {formatQuantity(item.quantity, item.unit)}
                      </span>
                    )}
                    {item.is_checked && item.checked_by && (
                      <span className="item-checked-by">
                        ✓ by {item.checked_by.display_name || item.checked_by.email}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="btn-delete-item"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item */}
      <div className="add-item-section">
        {showAddItem ? (
          <div className="add-item-form">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomItem()}
              placeholder="Item name..."
              className="add-item-input"
              autoFocus
            />
            <button onClick={handleAddCustomItem} className="btn-add-confirm">
              Add
            </button>
            <button
              onClick={() => {
                setShowAddItem(false);
                setNewItemName('');
              }}
              className="btn-add-cancel"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAddItem(true)} className="btn-add-item">
            + Add Custom Item
          </button>
        )}
      </div>

      {/* Back Link */}
      <div className="grocery-footer">
        <Link to="/plan" className="btn-back-to-plan">
          ← Back to Meal Plan
        </Link>
      </div>
    </div>
  );
};

export default GroceryPage;
