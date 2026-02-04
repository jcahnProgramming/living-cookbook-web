import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import './CookingMode.css';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
}

interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  time_estimate_sec?: number;  // Changed from time_minutes
  image_url?: string;
}

interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;  // Changed from 'item'
  quantity?: number;
  unit?: string;
  section?: string;  // Changed from 'category'
  notes?: string;
}

const CookingMode: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [showIngredients, setShowIngredients] = useState(false);
  const [timersModalCollapsed, setTimersModalCollapsed] = useState(false);
  
  // Changed: timers is now a Map keyed by step number, not just current step
  const [timers, setTimers] = useState<Map<number, {
    stepNumber: number;
    duration: number;
    remaining: number;
    isActive: boolean;
  }>>(new Map());
  
  const [isLoading, setIsLoading] = useState(true);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Keep screen awake during cooking
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Screen wake lock activated');
        }
      } catch (err) {
        console.error('Wake lock failed:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
        console.log('Screen wake lock released');
      }
    };
  }, []);

  useEffect(() => {
    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  // Timer tick effect - handles ALL active timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = new Map(prev);
        let hasChanges = false;

        updated.forEach((timer, stepNum) => {
          if (timer.isActive && timer.remaining > 0) {
            timer.remaining -= 1;
            hasChanges = true;

            // Timer completed!
            if (timer.remaining === 0) {
              timer.isActive = false;
              playTimerSound(stepNum);
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadRecipe = async () => {
    if (!recipeId) return;

    setIsLoading(true);
    try {
      // Load recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;
      setRecipe(recipeData);

      // Load steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;
      setSteps(stepsData || []);

      // Load ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('sort_order', { ascending: true });

      if (ingredientsError) throw ingredientsError;
      setIngredients(ingredientsData || []);

    } catch (error) {
      console.error('Failed to load recipe:', error);
      alert('Failed to load recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const playTimerSound = (stepNumber: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Step ${stepNumber + 1} Timer Complete!`, {
        body: `Timer for step ${stepNumber + 1} has finished`,
      });
    }

    // Also show alert as fallback
    alert(`⏰ Step ${stepNumber + 1} Timer Complete!`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleIngredient = (ingredientId: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientId)) {
      newChecked.delete(ingredientId);
    } else {
      newChecked.add(ingredientId);
    }
    setCheckedIngredients(newChecked);
  };

  const startTimer = (stepNumber: number) => {
    const step = steps[stepNumber];
    if (!step?.time_estimate_sec) return;

    setTimers(prev => {
      const updated = new Map(prev);
      updated.set(stepNumber, {
        stepNumber,
        duration: step.time_estimate_sec!,
        remaining: step.time_estimate_sec!,
        isActive: true,
      });
      return updated;
    });
  };

  const pauseTimer = (stepNumber: number) => {
    setTimers(prev => {
      const updated = new Map(prev);
      const timer = updated.get(stepNumber);
      if (timer) {
        timer.isActive = false;
      }
      return updated;
    });
  };

  const resumeTimer = (stepNumber: number) => {
    setTimers(prev => {
      const updated = new Map(prev);
      const timer = updated.get(stepNumber);
      if (timer) {
        timer.isActive = true;
      }
      return updated;
    });
  };

  const resetTimer = (stepNumber: number) => {
    const step = steps[stepNumber];
    if (!step?.time_estimate_sec) return;

    setTimers(prev => {
      const updated = new Map(prev);
      updated.set(stepNumber, {
        stepNumber,
        duration: step.time_estimate_sec!,
        remaining: step.time_estimate_sec!,
        isActive: false,
      });
      return updated;
    });
  };

  const getActiveTimers = () => {
    const active: Array<{
      stepNumber: number; 
      stepName: string; 
      description: string;
      remaining: number; 
      isActive: boolean;
    }> = [];
    
    timers.forEach((timer, stepNum) => {
      if (timer.remaining > 0 || timer.isActive) {
        const step = steps[stepNum];
        // Extract first sentence or up to 50 chars as description
        let description = '';
        if (step?.instruction) {
          const firstSentence = step.instruction.split('.')[0];
          description = firstSentence.length > 50 
            ? firstSentence.substring(0, 47) + '...'
            : firstSentence;
        }
        
        active.push({
          stepNumber: stepNum,
          stepName: `Step ${stepNum + 1}`,
          description,
          remaining: timer.remaining,
          isActive: timer.isActive,
        });
      }
    });
    return active.sort((a, b) => a.stepNumber - b.stepNumber);
  };


  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Timers keep running!
    } else {
      // Finished cooking!
      handleFinish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Timers keep running!
    }
  };

  const handleFinish = () => {
    const share = window.confirm('Congratulations! 🎉\n\nShare your meal to your feed?');
    if (share) {
      // Navigate to create meal post with recipe pre-filled
      navigate('/create-meal-post', { 
        state: { 
          recipeId: recipeId,
          recipeTitle: recipe?.title 
        } 
      });
    } else {
      navigate(`/recipe/${recipeId}`);
    }
  };

  const exitCookingMode = () => {
    if (window.confirm('Exit cooking mode? Your progress will not be saved.')) {
      navigate(`/recipe/${recipeId}`);
    }
  };

  const cycleTextSize = () => {
    setTextSize(current => {
      if (current === 'normal') return 'large';
      if (current === 'large') return 'xlarge';
      return 'normal';
    });
  };

  if (isLoading) {
    return (
      <div className="cooking-mode">
        <div className="loading-state">
          <div className="loading-spinner">🍳</div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe || steps.length === 0) {
    return (
      <div className="cooking-mode">
        <div className="error-state">
          <h2>No cooking instructions available</h2>
          <p>This recipe doesn't have step-by-step instructions yet.</p>
          <button onClick={() => navigate(`/recipe/${recipeId}`)} className="btn-primary">
            Back to Recipe
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`cooking-mode text-${textSize}`}>
      {/* Header */}
      <div className="cooking-header">
        <button onClick={exitCookingMode} className="exit-button">
          ✕
        </button>
        <h1 className="recipe-title">{recipe.title}</h1>
        <div className="header-actions">
          <button 
            onClick={cycleTextSize}
            className="text-size-button"
            title="Change text size"
          >
            A
          </button>
          <button 
            onClick={() => setShowIngredients(!showIngredients)}
            className="ingredients-toggle"
            title="Show ingredients"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="cooking-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Collapsible Floating Timers Box */}
      {(() => {
        const activeTimers = getActiveTimers();
        const otherStepTimers = activeTimers.filter(t => t.stepNumber !== currentStep);
        
        if (otherStepTimers.length === 0) return null;

        const urgentTimer = otherStepTimers.reduce((min, timer) => 
          timer.remaining < min.remaining ? timer : min
        );

        return (
          <div className={`floating-timers-modal ${timersModalCollapsed ? 'collapsed' : 'expanded'}`}>
            <div className="floating-modal-header">
              <span className="floating-modal-title">⏱️ OTHER ACTIVE TIMERS</span>
              <button 
                onClick={() => setTimersModalCollapsed(!timersModalCollapsed)}
                className="floating-modal-toggle"
              >
                {timersModalCollapsed ? `View All (${otherStepTimers.length})` : 'View Less'}
              </button>
            </div>
            
            {timersModalCollapsed ? (
              // Collapsed - show only most urgent
              <div className="floating-modal-content">
                <div 
                  className="floating-timer-card"
                  onClick={() => setCurrentStep(urgentTimer.stepNumber)}
                >
                  <div className="floating-timer-info">
                    <span className="floating-timer-step">Step {urgentTimer.stepNumber + 1}</span>
                    <span className="floating-timer-desc">{urgentTimer.description}</span>
                  </div>
                  <span className={`floating-timer-time ${urgentTimer.remaining <= 10 && urgentTimer.isActive ? 'urgent' : ''}`}>
                    {formatTime(urgentTimer.remaining)}
                  </span>
                </div>
              </div>
            ) : (
              // Expanded - show all timers
              <div className="floating-modal-content">
                {otherStepTimers.map(timer => (
                  <div 
                    key={timer.stepNumber}
                    className="floating-timer-card"
                    onClick={() => setCurrentStep(timer.stepNumber)}
                  >
                    <div className="floating-timer-info">
                      <span className="floating-timer-step">Step {timer.stepNumber + 1}</span>
                      <span className="floating-timer-desc">{timer.description}</span>
                    </div>
                    <span className={`floating-timer-time ${timer.remaining <= 10 && timer.isActive ? 'urgent' : ''}`}>
                      {formatTime(timer.remaining)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Main Content */}
      <div className="cooking-content">
        {/* Step Card */}
        <div className="step-card">
          <div className="step-header">
            <span className="step-number">Step {currentStep + 1}</span>
            {currentStepData.time_estimate_sec && (
              <span className="step-time">⏱️ {Math.ceil(currentStepData.time_estimate_sec / 60)} min</span>
            )}
          </div>

          <div className="step-instruction">
            {currentStepData.instruction}
          </div>

          {currentStepData.image_url && (
            <div className="step-image">
              <img src={currentStepData.image_url} alt={`Step ${currentStep + 1}`} />
            </div>
          )}

          {/* Timer */}
          {currentStepData.time_estimate_sec && (
            <div className="step-timer">
              {(() => {
                const stepTimer = timers.get(currentStep);
                
                if (!stepTimer) {
                  // Timer not started yet
                  return (
                    <button 
                      onClick={() => startTimer(currentStep)} 
                      className="btn-timer-start"
                    >
                      ⏱️ Start {Math.ceil(currentStepData.time_estimate_sec / 60)} minute timer
                    </button>
                  );
                }

                // Timer exists (started, paused, or completed)
                return (
                  <>
                    <div className={`timer-display ${stepTimer.remaining <= 10 && stepTimer.isActive ? 'timer-urgent' : ''}`}>
                      {formatTime(stepTimer.remaining)}
                    </div>
                    <div className="timer-controls">
                      {!stepTimer.isActive ? (
                        <button onClick={() => resumeTimer(currentStep)} className="btn-timer">
                          ▶️ Start
                        </button>
                      ) : (
                        <button onClick={() => pauseTimer(currentStep)} className="btn-timer">
                          ⏸️ Pause
                        </button>
                      )}
                      <button onClick={() => resetTimer(currentStep)} className="btn-timer-secondary">
                        🔄 Reset
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="cooking-navigation">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="btn-nav btn-prev"
          >
            ← Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button 
              onClick={nextStep}
              className="btn-nav btn-next"
            >
              Next Step →
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              className="btn-nav btn-finish"
            >
              🎉 Finish Cooking
            </button>
          )}
        </div>

        {/* Next Step Preview */}
        {currentStep < steps.length - 1 && (
          <div className="next-step-preview">
            <div className="preview-label">Up next:</div>
            <div className="preview-text">
              {steps[currentStep + 1].instruction.substring(0, 80)}...
            </div>
          </div>
        )}
      </div>

      {/* Ingredients Sidebar */}
      {showIngredients && (
        <>
          <div className="ingredients-sidebar">
            <div className="sidebar-header">
              <h3>Ingredients</h3>
              <button 
                onClick={() => setShowIngredients(false)}
                className="close-sidebar"
              >
                ✕
              </button>
            </div>
            <div className="ingredients-list">
              {ingredients.length === 0 ? (
                <p className="no-ingredients">No ingredients listed</p>
              ) : (
                ingredients.map(ingredient => (
                  <label key={ingredient.id} className="ingredient-item">
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                    />
                    <span className={checkedIngredients.has(ingredient.id) ? 'checked' : ''}>
                      {ingredient.quantity && `${ingredient.quantity} `}
                      {ingredient.unit && `${ingredient.unit} `}
                      {ingredient.name}
                      {ingredient.notes && ` (${ingredient.notes})`}
                    </span>
                  </label>
                ))
              )}
            </div>
            <div className="ingredients-progress">
              {checkedIngredients.size} of {ingredients.length} checked
            </div>
          </div>
          <div 
            className="sidebar-overlay"
            onClick={() => setShowIngredients(false)}
          />
        </>
      )}
    </div>
  );
};

export default CookingMode;
