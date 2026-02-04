import { supabase } from '@/lib/supabase';

export interface MealPost {
  id: string;
  user_id: string;
  recipe_id?: string;
  caption?: string;
  cooked_date: string;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  photos?: MealPostPhoto[];
  user?: {
    display_name: string;
    avatar_url?: string;
  };
  recipe?: {
    title: string;
    images?: any;
  };
}

export interface MealPostPhoto {
  id: string;
  meal_post_id: string;
  photo_url: string;
  sort_order: number;
  created_at: string;
}

export interface CreateMealPostData {
  recipe_id?: string;
  caption?: string;
  cooked_date?: string;
  visibility?: 'public' | 'friends' | 'private';
  photo_urls: string[];
}

/**
 * Create a new meal post
 */
export async function createMealPost(
  userId: string,
  data: CreateMealPostData
): Promise<MealPost> {
  try {
    // Create the meal post
    const { data: post, error: postError } = await supabase
      .from('meal_posts')
      .insert({
        user_id: userId,
        recipe_id: data.recipe_id || null,
        caption: data.caption || null,
        cooked_date: data.cooked_date || new Date().toISOString().split('T')[0],
        visibility: data.visibility || 'public',
      })
      .select()
      .single();

    if (postError) throw postError;

    // Add photos
    if (data.photo_urls.length > 0) {
      const photos = data.photo_urls.map((url, index) => ({
        meal_post_id: post.id,
        photo_url: url,
        sort_order: index,
      }));

      const { error: photosError } = await supabase
        .from('meal_post_photos')
        .insert(photos);

      if (photosError) throw photosError;
    }

    return post;
  } catch (error) {
    console.error('Failed to create meal post:', error);
    throw error;
  }
}

/**
 * Get meal posts by user
 */
export async function getUserMealPosts(userId: string): Promise<MealPost[]> {
  try {
    // Get meal posts
    const { data: posts, error: postsError } = await supabase
      .from('meal_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return [];

    // Get photos for all posts
    const postIds = posts.map(p => p.id);
    const { data: photos, error: photosError } = await supabase
      .from('meal_post_photos')
      .select('*')
      .in('meal_post_id', postIds)
      .order('sort_order', { ascending: true });

    if (photosError) throw photosError;

    // Get recipe info for posts that have recipes
    const recipeIds = posts
      .filter(p => p.recipe_id)
      .map(p => p.recipe_id as string);

    let recipes: any[] = [];
    if (recipeIds.length > 0) {
      const { data: recipeData, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, images')
        .in('id', recipeIds);

      if (recipesError) throw recipesError;
      recipes = recipeData || [];
    }

    // Combine posts with their photos and recipe info
    const postsWithPhotos = posts.map(post => ({
      ...post,
      photos: photos?.filter(photo => photo.meal_post_id === post.id) || [],
      recipe: recipes.find(r => r.id === post.recipe_id),
    }));

    return postsWithPhotos;
  } catch (error) {
    console.error('Failed to get user meal posts:', error);
    return [];
  }
}

/**
 * Get a single meal post by ID
 */
export async function getMealPost(postId: string): Promise<MealPost | null> {
  try {
    // Get the post
    const { data: post, error: postError } = await supabase
      .from('meal_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError) throw postError;
    if (!post) return null;

    // Get photos
    const { data: photos, error: photosError } = await supabase
      .from('meal_post_photos')
      .select('*')
      .eq('meal_post_id', postId)
      .order('sort_order', { ascending: true });

    if (photosError) throw photosError;

    return {
      ...post,
      photos: photos || [],
    };
  } catch (error) {
    console.error('Failed to get meal post:', error);
    return null;
  }
}

/**
 * Delete a meal post
 */
export async function deleteMealPost(postId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meal_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete meal post:', error);
    throw error;
  }
}

/**
 * Upload meal post photo to storage
 */
export async function uploadMealPhoto(
  userId: string,
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `meal-posts/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file, {
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to upload meal photo:', error);
    throw error;
  }
}

/**
 * Get public meal posts (for feed)
 */
export async function getPublicMealPosts(limit: number = 20): Promise<MealPost[]> {
  try {
    // Get posts
    const { data: posts, error: postsError } = await supabase
      .from('meal_posts')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return [];

    // Get photos for all posts
    const postIds = posts.map(p => p.id);
    const { data: photos, error: photosError } = await supabase
      .from('meal_post_photos')
      .select('*')
      .in('meal_post_id', postIds)
      .order('sort_order', { ascending: true });

    if (photosError) throw photosError;

    // Combine posts with their photos
    const postsWithPhotos = posts.map(post => ({
      ...post,
      photos: photos?.filter(photo => photo.meal_post_id === post.id) || [],
    }));

    return postsWithPhotos;
  } catch (error) {
    console.error('Failed to get public meal posts:', error);
    return [];
  }
}
