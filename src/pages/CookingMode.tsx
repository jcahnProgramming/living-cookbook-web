import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeDetails } from '@/features/recipes/userRecipeService';
import './CookingMode.css';

interface Timer {
  id: string;
  duration: number; // seconds
  isRunning: boolean;
  remaining: number; // seconds
  intervalId?: number;
}

const CookingMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timers, setTimers] = useState<Map<string, Timer>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await getRecipeDetails(id);
      setRecipe(data);

      // Get steps from either user-created or imported recipe
      let recipeSteps: any[] = [];
      
      if ((data as any).steps && Array.isArray((data as any).steps)) {
        // User-created recipe
        recipeSteps = (data as any).steps.sort((a: any, b: any) => a.step_number - b.step_number);
      } else if (data.cooking_countdown_schedule?.steps) {
        // Imported recipe
        recipeSteps = data.cooking_countdown_schedule.steps;
      }

      setSteps(recipeSteps);
    } catch (err) {
      console.error('Failed to load recipe:', err);
      setError('Failed to load recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = (timerId: string, duration: number) => {
    const newTimer: Timer = {
      id: timerId,
      duration,
      remaining: duration,
      isRunning: true,
    };

    const intervalId = window.setInterval(() => {
      setTimers((prev) => {
        const updated = new Map(prev);
        const timer = updated.get(timerId);
        
        if (timer && timer.remaining > 0) {
          timer.remaining -= 1;
          
          if (timer.remaining === 0) {
            timer.isRunning = false;
            if (timer.intervalId) {
              clearInterval(timer.intervalId);
            }
            // Play sound or notification here
            alert(`Timer complete: ${timerId}`);
          }
        }
        
        return updated;
      });
    }, 1000);

    newTimer.intervalId = intervalId;
    setTimers((prev) => new Map(prev).set(timerId, newTimer));
  };

  const pauseTimer = (timerId: string) => {
    setTimers((prev) => {
      const updated = new Map(prev);
      const timer = updated.get(timerId);
      
      if (timer) {
        timer.isRunning = false;
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
        }
      }
      
      return updated;
    });
  };

  const resumeTimer = (timerId: string) => {
    setTimers((prev) => {
      const updated = new Map(prev);
      const timer = updated.get(timerId);
      
      if (timer && !timer.isRunning) {
        timer.isRunning = true;
        
        const intervalId = window.setInterval(() => {
          setTimers((prev2) => {
            const updated2 = new Map(prev2);
            const t = updated2.get(timerId);
            
            if (t && t.remaining > 0) {
              t.remaining -= 1;
              
              if (t.remaining === 0) {
                t.isRunning = false;
                if (t.intervalId) {
                  clearInterval(t.intervalId);
                }
                alert(`Timer complete!`);
              }
            }
            
            return updated2;
          });
        }, 1000);
        
        timer.intervalId = intervalId;
      }
      
      return updated;
    });
  };

  const resetTimer = (timerId: string) => {
    setTimers((prev) => {
      const updated = new Map(prev);
      const timer = updated.get(timerId);
      
      if (timer) {
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
        }
        updated.delete(timerId);
      }
      
      return updated;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const exitCookingMode = () => {
    // Clean up all timers
    timers.forEach((timer) => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    });
    navigate(`/recipe/${id}`);
  };

  if (isLoading) {
    return (
      <div className="cooking-mode">
        <div className="cooking-loading">
          <div className="loading-spinner">🍳</div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe || steps.length === 0) {
    return (
      <div className="cooking-mode">
        <div className="cooking-error">
          <h2>Unable to start cooking mode</h2>
          <p>{error || 'No cooking instructions available for this recipe.'}</p>
          <button onClick={() => navigate(`/recipe/${id}`)} className="btn-back">
            ← Back to Recipe
          </button>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="cooking-mode">
      {/* Header */}
      <div className="cooking-header">
        <button onClick={exitCookingMode} className="btn-exit">
          ✕
        </button>
        <div className="cooking-title">
          <h1>{recipe.title}</h1>
          <div className="cooking-progress">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Current Step */}
      <div className="cooking-content">
        <div className="step-card current-step">
          <div className="step-number">{currentStep.step_number || currentStepIndex + 1}</div>
          <div className="step-instruction">
            {currentStep.instruction || currentStep.summary || 'No instruction available'}
          </div>

          {/* Timer for this step */}
          {currentStep.time_estimate_sec && currentStep.time_estimate_sec > 0 && (
            <div className="step-timer-card">
              <div className="timer-label">⏲️ Suggested time for this step</div>
              {(() => {
                const timerId = `step-${currentStepIndex}`;
                const timer = timers.get(timerId);
                
                if (!timer) {
                  return (
                    <button
                      onClick={() => startTimer(timerId, currentStep.time_estimate_sec)}
                      className="btn-timer-start"
                    >
                      ▶️ Start {formatTime(currentStep.time_estimate_sec)} Timer
                    </button>
                  );
                }
                
                return (
                  <div className="timer-display">
                    <div className={`timer-time ${timer.remaining <= 10 ? 'timer-urgent' : ''}`}>
                      {formatTime(timer.remaining)}
                    </div>
                    <div className="timer-controls">
                      {timer.isRunning ? (
                        <button onClick={() => pauseTimer(timerId)} className="btn-timer-pause">
                          ⏸️ Pause
                        </button>
                      ) : (
                        <button onClick={() => resumeTimer(timerId)} className="btn-timer-resume">
                          ▶️ Resume
                        </button>
                      )}
                      <button onClick={() => resetTimer(timerId)} className="btn-timer-reset">
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="cooking-navigation">
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="btn-nav btn-prev"
          >
            ← Previous
          </button>

          {currentStepIndex === steps.length - 1 ? (
            <button onClick={exitCookingMode} className="btn-nav btn-finish">
              ✓ Finish Cooking
            </button>
          ) : (
            <button onClick={goToNextStep} className="btn-nav btn-next">
              Next →
            </button>
          )}
        </div>

        {/* Step Preview (next step) */}
        {currentStepIndex < steps.length - 1 && (
          <div className="step-preview">
            <div className="preview-label">Coming up next:</div>
            <div className="preview-content">
              <span className="preview-number">{steps[currentStepIndex + 1].step_number || currentStepIndex + 2}</span>
              <span className="preview-text">
                {(steps[currentStepIndex + 1].instruction || steps[currentStepIndex + 1].summary || '').substring(0, 60)}...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingMode;
