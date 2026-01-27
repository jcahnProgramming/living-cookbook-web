import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [groceryList, setGroceryList] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  const tempUserId = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveGroceryList(tempUserId);
      setGroceryList(data);
    } catch (error) {
      console.error('Failed to load grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateList = async () => {
    try {
      setIsGenerating(true);
      
      // Get current week's meal plan
      const weekStart = getWeekStart(new Date());
      const mealPlan = await getMealPlanForWeek(weekStart, tempUserId);
      
      if (!mealPlan || !mealPlan.meal_plan_items || mealPlan.meal_plan_items.length === 0) {
        alert('No meals in your plan! Add some recipes to your meal plan first.');
        return;
      }

      // Generate grocery list
      const newList = await generateGroceryListFromMealPlan(mealPlan.id, tempUserId);
      setGroceryList(newList);
    } catch (error) {
      console.error('Failed to generate grocery list:', error);
      alert('Failed to generate grocery list. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleItem = async (itemId: string, currentState: boolean) => {
    try {
      await toggleGroceryItem(itemId, !currentState);
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
        <div className="grocery-empty">
          <div className="empty-icon">🛒</div>
          <h2>No Grocery List Yet</h2>
          <p>Generate a grocery list from your meal plan to get started!</p>
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
