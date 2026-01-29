import { useEffect, useRef, useState } from 'react';
import { generateGroceryListFromMealPlan } from '@/features/grocery/groceryService';

interface UseAutoSyncGroceryOptions {
  mealPlanId: string | null;
  userId: string | null;
  householdId: string | null;
  enabled: boolean;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Hook to automatically sync grocery list when meal plan changes
 * Debounces updates to avoid excessive regeneration
 */
export function useAutoSyncGrocery({
  mealPlanId,
  userId,
  householdId,
  enabled,
  onSyncComplete,
  onSyncError,
}: UseAutoSyncGroceryOptions) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousMealPlanIdRef = useRef<string | null>(null);

  // Debounce delay in milliseconds
  const DEBOUNCE_DELAY = 2000; // 2 seconds after last change

  const syncGroceryList = async () => {
    if (!mealPlanId || !userId || !enabled) return;

    try {
      setIsSyncing(true);
      
      console.log('🔄 Auto-syncing grocery list...', {
        mealPlanId,
        userId,
        householdId,
      });

      await generateGroceryListFromMealPlan(mealPlanId, userId, householdId);
      
      setLastSyncTime(new Date());
      console.log('✅ Auto-sync complete!');
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
      if (onSyncError) {
        onSyncError(error as Error);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const scheduleSyncWithDebounce = () => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Schedule new sync
    debounceTimerRef.current = setTimeout(() => {
      syncGroceryList();
    }, DEBOUNCE_DELAY);
  };

  // Watch for meal plan changes
  useEffect(() => {
    if (!enabled || !mealPlanId) return;

    // If meal plan ID changed, schedule a sync
    if (previousMealPlanIdRef.current !== mealPlanId) {
      previousMealPlanIdRef.current = mealPlanId;
      
      // Don't sync immediately on mount, only on actual changes
      if (previousMealPlanIdRef.current !== null) {
        scheduleSyncWithDebounce();
      }
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [mealPlanId, enabled]);

  // Manual trigger for when recipes are added/removed
  const triggerSync = () => {
    if (enabled && mealPlanId && userId) {
      scheduleSyncWithDebounce();
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    triggerSync,
  };
}
