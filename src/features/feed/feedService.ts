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
}

export interface MealPostPhoto {
  id: string;
  meal_post_id: string;
  photo_url: string;
  sort_order: number;
}

export interface FeedPost extends MealPost {
  photos: MealPostPhoto[];
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  recipe?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

/**
 * Get following feed - posts from users you follow
 */
export async function getFollowingFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<FeedPost[]> {
  try {
    // Get list of users the current user follows
    const { data: following, error: followingError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) throw followingError;
    if (!following || following.length === 0) return [];

    const followingIds = following.map(f => f.following_id);

    // Get meal posts from followed users
    const { data: posts, error: postsError } = await supabase
      .from('meal_posts')
      .select('*')
      .in('user_id', followingIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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

    // Get user info for all posts
    const userIds = [...new Set(posts.map(p => p.user_id))];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Get recipe info for posts that have recipes
    const recipeIds = posts
      .filter(p => p.recipe_id)
      .map(p => p.recipe_id as string);

    let recipes: any[] = [];
    if (recipeIds.length > 0) {
      const { data: recipeData, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, image_url')
        .in('id', recipeIds);

      if (recipesError) throw recipesError;
      recipes = recipeData || [];
    }

    // Combine everything
    const feedPosts: FeedPost[] = posts.map(post => {
      const postPhotos = photos?.filter(photo => photo.meal_post_id === post.id) || [];
      const user = users?.find(u => u.id === post.user_id);
      const recipe = recipes?.find(r => r.id === post.recipe_id);

      return {
        ...post,
        photos: postPhotos,
        user: user || { id: post.user_id, display_name: 'Unknown User' },
        recipe: recipe || undefined,
      };
    });

    return feedPosts;
  } catch (error) {
    console.error('Failed to get following feed:', error);
    return [];
  }
}

/**
 * Get friends feed - posts from mutual friends
 * For now, this returns an empty array until friends system is built
 */
export async function getFriendsFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<FeedPost[]> {
  try {
    // TODO: Implement when friends system is built
    // For now, get posts from users who follow back (mutual follows)
    
    // Get users you follow
    const { data: following, error: followingError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) throw followingError;
    if (!following || following.length === 0) return [];

    const followingIds = following.map(f => f.following_id);

    // Get users who follow you back (mutual)
    const { data: followers, error: followersError } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId)
      .in('follower_id', followingIds);

    if (followersError) throw followersError;
    if (!followers || followers.length === 0) return [];

    const mutualIds = followers.map(f => f.follower_id);

    // Get meal posts from mutual follows
    const { data: posts, error: postsError } = await supabase
      .from('meal_posts')
      .select('*')
      .in('user_id', mutualIds)
      .in('visibility', ['public', 'friends'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return [];

    // Get photos, users, and recipes (same as following feed)
    const postIds = posts.map(p => p.id);
    const { data: photos } = await supabase
      .from('meal_post_photos')
      .select('*')
      .in('meal_post_id', postIds)
      .order('sort_order', { ascending: true });

    const userIds = [...new Set(posts.map(p => p.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const recipeIds = posts
      .filter(p => p.recipe_id)
      .map(p => p.recipe_id as string);

    let recipes: any[] = [];
    if (recipeIds.length > 0) {
      const { data: recipeData } = await supabase
        .from('recipes')
        .select('id, title, image_url')
        .in('id', recipeIds);
      recipes = recipeData || [];
    }

    // Combine everything
    const feedPosts: FeedPost[] = posts.map(post => {
      const postPhotos = photos?.filter(photo => photo.meal_post_id === post.id) || [];
      const user = users?.find(u => u.id === post.user_id);
      const recipe = recipes?.find(r => r.id === post.recipe_id);

      return {
        ...post,
        photos: postPhotos,
        user: user || { id: post.user_id, display_name: 'Unknown User' },
        recipe: recipe || undefined,
      };
    });

    return feedPosts;
  } catch (error) {
    console.error('Failed to get friends feed:', error);
    return [];
  }
}

/**
 * Get explore feed - recent public posts from all users
 */
export async function getExploreFeed(
  limit: number = 20,
  offset: number = 0
): Promise<FeedPost[]> {
  try {
    // Get recent public meal posts
    const { data: posts, error: postsError } = await supabase
      .from('meal_posts')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return [];

    // Get photos, users, and recipes
    const postIds = posts.map(p => p.id);
    const { data: photos } = await supabase
      .from('meal_post_photos')
      .select('*')
      .in('meal_post_id', postIds)
      .order('sort_order', { ascending: true });

    const userIds = [...new Set(posts.map(p => p.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const recipeIds = posts
      .filter(p => p.recipe_id)
      .map(p => p.recipe_id as string);

    let recipes: any[] = [];
    if (recipeIds.length > 0) {
      const { data: recipeData } = await supabase
        .from('recipes')
        .select('id, title, image_url')
        .in('id', recipeIds);
      recipes = recipeData || [];
    }

    // Combine everything
    const feedPosts: FeedPost[] = posts.map(post => {
      const postPhotos = photos?.filter(photo => photo.meal_post_id === post.id) || [];
      const user = users?.find(u => u.id === post.user_id);
      const recipe = recipes?.find(r => r.id === post.recipe_id);

      return {
        ...post,
        photos: postPhotos,
        user: user || { id: post.user_id, display_name: 'Unknown User' },
        recipe: recipe || undefined,
      };
    });

    return feedPosts;
  } catch (error) {
    console.error('Failed to get explore feed:', error);
    return [];
  }
}
