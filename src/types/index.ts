/**
 * Living Cookbook Type Definitions
 * Based on recipe_template.json schema v1.0.0
 */

// ========================================
// USER & AUTH TYPES
// ========================================

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ========================================
// RECIPE TYPES
// ========================================

export interface RecipeAuthor {
  id: string;
  display_name: string;
  source: 'internal' | 'marketplace' | 'user_generated';
}

export interface RecipeYield {
  servings: number;
  units: string;
  notes?: string;
}

export interface Equipment {
  name: string;
  quantity: number;
  notes?: string;
}

export interface TimeEstimate {
  total_time_estimate_sec: number;
  prep_time_estimate_sec: number;
  cook_time_estimate_sec: number;
  active_time_estimate_sec: number;
  passive_time_estimate_sec: number;
  time_model_notes?: string;
}

export interface GroceryItem {
  item_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  metric_quantity?: number;
  metric_unit?: string;
  notes?: string;
  optional: boolean;
  substitutions?: Array<{
    name: string;
    notes?: string;
  }>;
}

export interface GrocerySection {
  name: string;
  items: GroceryItem[];
}

export interface GroceryList {
  notes?: string;
  sections: GrocerySection[];
}

export interface TimerAlert {
  at_sec_remaining: number;
  message: string;
}

export interface Timer {
  timer_id: string;
  label: string;
  start_offset_sec: number;
  duration_sec: number;
  end_offset_sec: number;
  auto_start: boolean;
  required: boolean;
  ui?: {
    show_start_button: boolean;
    button_text: string;
    show_in_feed: boolean;
  };
  notes?: string;
  alerts?: TimerAlert[];
}

export interface StepMedia {
  type: 'image' | 'video';
  url?: string;
  alt?: string;
}

export interface RecipeStep {
  step_id: string;
  step_number: number;
  phase: 'prep' | 'cook' | 'finish' | 'plate';
  title: string;
  summary: string;
  instructions: string[];
  suggested_start_offset_sec: number;
  estimated_active_time_sec: number;
  media?: StepMedia[];
  dependencies?: string[];
  timers?: Timer[];
  completion_criteria?: string[];
  safety_notes?: string[];
}

export interface CookingSchedule {
  schedule_style: 'countdown' | 'linear';
  schedule_notes?: string;
  steps: RecipeStep[];
}

export interface TimerFeedItem {
  timer_id: string;
  recipe_step_id: string;
  recipe_step_number: number;
  label: string;
  start_offset_sec: number;
  duration_sec: number;
  end_offset_sec: number;
  required: boolean;
}

export interface PlatingRecommendation {
  plating_id: string;
  title: string;
  text: string;
  image?: {
    url?: string;
    alt?: string;
    credit?: string;
  };
}

export interface NutritionPerServing {
  calories_kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
}

export interface Allergen {
  name: string;
  present: boolean;
  notes?: string;
}

export interface DietaryInfo {
  vegetarian: boolean;
  vegan: boolean;
  gluten_free?: boolean;
  dairy_free?: boolean;
}

export interface Nutrition {
  notes?: string;
  per_serving: NutritionPerServing;
  allergens?: Allergen[];
  dietary?: DietaryInfo;
}

export interface RecipeVariation {
  title: string;
  changes: string[];
}

export interface RecipeContent {
  description?: string;
  tips?: string[];
  storage_and_reheating?: string[];
  variations?: RecipeVariation[];
}

export interface RecipeConstraints {
  no_spice?: boolean;
  max_total_time_sec?: number;
  kid_friendly?: boolean;
}

export interface RecipeImage {
  url?: string;
  alt?: string;
  credit?: string;
}

export interface RecipeImages {
  hero?: RecipeImage;
  gallery?: RecipeImage[];
}

export interface RecipeAudit {
  created_at_iso: string;
  updated_at_iso: string;
  source: 'manual' | 'generated' | 'imported';
  license: 'internal' | 'creative_commons' | 'proprietary';
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  author: RecipeAuthor;
  yield: RecipeYield;
  difficulty: 'easy' | 'medium' | 'hard';
  spice_level: 'none' | 'mild' | 'medium' | 'hot' | 'extra_hot';
  dietary_flags?: string[];
  equipment?: Equipment[];
  time: TimeEstimate;
  grocery_list: GroceryList;
  cooking_countdown_schedule: CookingSchedule;
  timers_feed: {
    notes?: string;
    items: TimerFeedItem[];
  };
  plating_recommendations?: {
    notes?: string;
    items: PlatingRecommendation[];
  };
  nutrition?: Nutrition;
  tags: string[];
  content?: RecipeContent;
  constraints?: RecipeConstraints;
  images?: RecipeImages;
  audit: RecipeAudit;
}

// ========================================
// COOKING MODE TYPES
// ========================================

export interface ActiveTimer {
  timer_id: string;
  started_at: number; // Unix timestamp
  duration_sec: number;
  remaining_sec: number;
  is_paused: boolean;
  is_completed: boolean;
}

export interface CookingSession {
  recipe_id: string;
  started_at: number; // Unix timestamp
  current_step: number;
  completed_steps: string[];
  active_timers: ActiveTimer[];
  is_paused: boolean;
}

// ========================================
// MEAL PLANNING TYPES
// ========================================

export interface MealPlanItem {
  id: string;
  recipe_id: string;
  date: string; // ISO date string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  household_id?: string;
  week_start_date: string; // ISO date string
  items: MealPlanItem[];
}

// ========================================
// GROCERY LIST TYPES
// ========================================

export interface GroceryListItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  is_checked: boolean;
  recipe_ids: string[]; // Track which recipes need this item
}

export interface AggregatedGroceryList {
  id: string;
  meal_plan_id: string;
  generated_at: string;
  items: GroceryListItem[];
}

// ========================================
// FAVORITES & COLLECTIONS
// ========================================

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  recipe_ids: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// NOTES TYPES
// ========================================

export interface RecipeNote {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// VOLUME & MARKETPLACE TYPES (Future)
// ========================================

export interface Volume {
  id: string;
  title: string;
  description: string;
  price: number;
  recipe_count: number;
  thumbnail_url?: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  volume_id: string;
  purchased_at: string;
  price_paid: number;
}
