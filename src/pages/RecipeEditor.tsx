import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRecipeDetails } from '@/features/recipes/userRecipeService';
import { supabase } from '@/lib/supabase';
import type { RecipeIngredient, RecipeStep } from '@/features/recipes/userRecipeService';
import './RecipeBuilder.css'; // Reuse same styles

const RecipeEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Ingredients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', quantity: undefined, unit: '' }
  ]);

  // Steps
  const [steps, setSteps] = useState<RecipeStep[]>([
    { stepNumber: 1, instruction: '' }
  ]);

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Plating & Serving
  const [platingNotes, setPlatingNotes] = useState('');

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load recipe data
  useEffect(() => {
    if (id && user?.id) {
      loadRecipe();
    }
  }, [id, user?.id]);

  const loadRecipe = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const recipe = await getRecipeDetails(id);

      // Check if user owns this recipe
      if ((recipe as any).user_id !== user?.id) {
        alert('You can only edit your own recipes');
        navigate('/library');
        return;
      }

      // Populate form
      setTitle(recipe.title || '');
      setDescription((recipe.content as any)?.description || '');
      setServings(recipe.yield_servings || 4);
      setPrepTime(recipe.prep_time_estimate_sec ? String(Math.floor(recipe.prep_time_estimate_sec / 60)) : '');
      setCookTime(recipe.cook_time_estimate_sec ? String(Math.floor(recipe.cook_time_estimate_sec / 60)) : '');
      setDifficulty(recipe.difficulty || 'medium');
      setTags(recipe.tags || []);
      setPlatingNotes((recipe as any).plating_notes || '');

      // Load ingredients
      if ((recipe as any).ingredients && (recipe as any).ingredients.length > 0) {
        setIngredients((recipe as any).ingredients.map((ing: any) => ({
          name: ing.name,
          quantity: ing.quantity || undefined,
          unit: ing.unit || '',
          notes: ing.notes || '',
          section: ing.section || 'Ingredients',
        })));
      }

      // Load steps
      if ((recipe as any).steps && (recipe as any).steps.length > 0) {
        setSteps((recipe as any).steps.map((step: any) => ({
          stepNumber: step.step_number,
          instruction: step.instruction,
          timeEstimateSec: step.time_estimate_sec || undefined,
        })));
      }
    } catch (error) {
      console.error('Failed to load recipe:', error);
      setError('Failed to load recipe');
    } finally {
      setIsLoading(false);
    }
  };

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: undefined, unit: '' }]);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Step handlers
  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  };

  const updateStep = (index: number, instruction: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], instruction };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    // Renumber steps
    updated.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(updated);
  };

  // Tag handlers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !id) return;

    if (!title.trim()) {
      setError('Recipe title is required');
      return;
    }

    if (ingredients.filter(ing => ing.name.trim()).length === 0) {
      setError('Add at least one ingredient');
      return;
    }

    if (steps.filter(step => step.instruction.trim()).length === 0) {
      setError('Add at least one instruction step');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Filter out empty ingredients and steps
      const validIngredients = ingredients.filter(ing => ing.name.trim());
      const validSteps = steps.filter(step => step.instruction.trim());

      // Convert time strings to seconds
      const prepTimeSec = prepTime ? parseInt(prepTime) * 60 : undefined;
      const cookTimeSec = cookTime ? parseInt(cookTime) * 60 : undefined;
      const totalTimeSec = (prepTimeSec || 0) + (cookTimeSec || 0);

      // Update recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          title: title.trim(),
          difficulty,
          tags,
          total_time_estimate_sec: totalTimeSec,
          prep_time_estimate_sec: prepTimeSec,
          cook_time_estimate_sec: cookTimeSec,
          plating_notes: platingNotes.trim() || null,
          content: {
            description: description.trim() || '',
          },
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (recipeError) throw recipeError;

      // Delete existing ingredients and steps
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
      await supabase.from('recipe_steps').delete().eq('recipe_id', id);

      // Insert new ingredients
      if (validIngredients.length > 0) {
        const ingredientsData = validIngredients.map((ing, index) => ({
          recipe_id: id,
          name: ing.name,
          quantity: ing.quantity || null,
          unit: ing.unit || null,
          notes: ing.notes || null,
          section: ing.section || 'Ingredients',
          sort_order: index,
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);

        if (ingredientsError) throw ingredientsError;
      }

      // Insert new steps
      if (validSteps.length > 0) {
        const stepsData = validSteps.map((step) => ({
          recipe_id: id,
          step_number: step.stepNumber,
          instruction: step.instruction,
          time_estimate_sec: step.timeEstimateSec || null,
        }));

        const { error: stepsError } = await supabase
          .from('recipe_steps')
          .insert(stepsData);

        if (stepsError) throw stepsError;
      }

      // Navigate back to recipe
      navigate(`/recipe/${id}`);
    } catch (err: any) {
      console.error('Failed to update recipe:', err);
      setError(err.message || 'Failed to update recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="recipe-builder">
        <div className="builder-header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-builder">
      <div className="builder-header">
        <h1>Edit Recipe</h1>
        <p>Update your recipe details</p>
      </div>

      <form onSubmit={handleSubmit} className="builder-form">
        {/* Basic Info */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grandma's Spaghetti"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this recipe special?"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="servings">Servings *</label>
              <input
                type="number"
                id="servings"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value))}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prepTime">Prep Time (minutes)</label>
              <input
                type="number"
                id="prepTime"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="30"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cookTime">Cook Time (minutes)</label>
              <input
                type="number"
                id="cookTime"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="45"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="difficulty-options">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="form-section">
          <h2>Ingredients *</h2>
          
          <div className="ingredients-list">
            {ingredients.map((ing, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="number"
                  value={ing.quantity || ''}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="2"
                  className="ingredient-quantity"
                  step="0.25"
                />
                <input
                  type="text"
                  value={ing.unit || ''}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  placeholder="cups"
                  className="ingredient-unit"
                />
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="flour"
                  className="ingredient-name"
                  required
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="btn-remove"
                    title="Remove ingredient"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addIngredient} className="btn-add">
            + Add Ingredient
          </button>
        </section>

        {/* Instructions */}
        <section className="form-section">
          <h2>Instructions *</h2>
          
          <div className="steps-list">
            {steps.map((step, index) => (
              <div key={index} className="step-row">
                <div className="step-number">{step.stepNumber}</div>
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder="Describe this step..."
                  rows={2}
                  required
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="btn-remove"
                    title="Remove step"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addStep} className="btn-add">
            + Add Step
          </button>
        </section>

        {/* Plating & Serving */}
        <section className="form-section">
          <h2>Plating & Serving (Optional)</h2>
          <p className="section-description">
            Add tips for plating, serving suggestions, or presentation ideas
          </p>
          
          <div className="form-group">
            <textarea
              value={platingNotes}
              onChange={(e) => setPlatingNotes(e.target.value)}
              placeholder="e.g., Garnish with fresh basil. Serve with crusty bread on the side..."
              rows={4}
            />
          </div>
        </section>

        {/* Tags */}
        <section className="form-section">
          <h2>Tags</h2>
          
          <div className="tags-input">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags (e.g., Italian, Dinner)"
            />
            <button type="button" onClick={addTag} className="btn-add-tag">
              Add Tag
            </button>
          </div>

          {tags.length > 0 && (
            <div className="tags-list">
              {tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>✕</button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/recipe/${id}`)}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeEditor;
