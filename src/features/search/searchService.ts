import { supabase } from '@/lib/supabase';

export interface SearchResult {
  type: 'user' | 'recipe' | 'post';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  data: any;
}

export interface SearchResults {
  users: SearchResult[];
  recipes: SearchResult[];
  posts: SearchResult[];
  total: number;
}

/**
 * Universal search - searches users, recipes, and meal posts
 */
export async function universalSearch(
  query: string,
  filters?: {
    type?: 'user' | 'recipe' | 'post';
    limit?: number;
  }
): Promise<SearchResults> {
  const limit = filters?.limit || 10;
  const searchType = filters?.type;

  const results: SearchResults = {
    users: [],
    recipes: [],
    posts: [],
    total: 0,
  };

  if (!query.trim()) return results;

  try {
    // Search users
    if (!searchType || searchType === 'user') {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, display_name, avatar_url, bio')
          .eq('profile_visibility', 'public')
          .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
          .limit(limit);

        if (error) {
          console.error('User search error:', error);
        }

        if (users) {
          results.users = users.map(user => ({
            type: 'user' as const,
            id: user.id,
            title: user.display_name,
            subtitle: user.bio || undefined,
            image: user.avatar_url || undefined,
            url: `/profile/${user.id}`,
            data: user,
          }));
        }
      } catch (error) {
        console.error('User search failed:', error);
      }
    }

    // Search recipes
    if (!searchType || searchType === 'recipe') {
      try {
        // Try searching by title only first (description might not exist)
        const { data: recipes, error } = await supabase
          .from('recipes')
          .select('*')
          .ilike('title', `%${query}%`)
          .limit(limit);

        if (error) {
          console.error('Recipe search error:', error);
        }

        if (recipes) {
          results.recipes = recipes.map(recipe => ({
            type: 'recipe' as const,
            id: recipe.id,
            title: recipe.title,
            subtitle: recipe.description || recipe.summary || undefined,
            image: recipe.image_url || recipe.imageUrl || undefined,
            url: `/recipe/${recipe.id}`, // Fixed: singular /recipe/ not /recipes/
            data: recipe,
          }));
        }
      } catch (error) {
        console.error('Recipe search failed:', error);
      }
    }

    // Search meal posts
    if (!searchType || searchType === 'post') {
      try {
        const { data: posts, error } = await supabase
          .from('meal_posts')
          .select(`
            id,
            caption,
            cooked_date,
            visibility,
            user_id,
            recipe_id
          `)
          .eq('visibility', 'public')
          .ilike('caption', `%${query}%`)
          .limit(limit);

        if (error) {
          console.error('Post search error:', error);
        }

        if (posts) {
          // Get user info for posts
          const userIds = [...new Set(posts.map(p => p.user_id))];
          const { data: users } = await supabase
            .from('users')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          // Get first photo for each post
          const postIds = posts.map(p => p.id);
          const { data: photos } = await supabase
            .from('meal_post_photos')
            .select('meal_post_id, photo_url')
            .in('meal_post_id', postIds)
            .order('display_order', { ascending: true });

          // Get first photo per post
          const firstPhotos = new Map();
          photos?.forEach(photo => {
            if (!firstPhotos.has(photo.meal_post_id)) {
              firstPhotos.set(photo.meal_post_id, photo.photo_url);
            }
          });

          results.posts = posts.map(post => {
            const user = users?.find(u => u.id === post.user_id);
            const photo = firstPhotos.get(post.id);
            
            return {
              type: 'post' as const,
              id: post.id,
              title: post.caption || 'Meal post',
              subtitle: user?.display_name ? `by ${user.display_name}` : undefined,
              image: photo || undefined,
              url: `/feed`,
              data: { ...post, user, photo },
            };
          });
        }
      } catch (error) {
        console.error('Post search failed:', error);
      }
    }

    results.total = results.users.length + results.recipes.length + results.posts.length;

    return results;
  } catch (error) {
    console.error('Search failed:', error);
    return results;
  }
}

/**
 * Search users only
 */
export async function searchUsers(query: string, limit = 20): Promise<SearchResult[]> {
  const results = await universalSearch(query, { type: 'user', limit });
  return results.users;
}

/**
 * Search recipes only
 */
export async function searchRecipes(query: string, limit = 20): Promise<SearchResult[]> {
  const results = await universalSearch(query, { type: 'recipe', limit });
  return results.recipes;
}

/**
 * Search meal posts only
 */
export async function searchPosts(query: string, limit = 20): Promise<SearchResult[]> {
  const results = await universalSearch(query, { type: 'post', limit });
  return results.posts;
}

/**
 * Get suggested users to follow
 */
export async function getSuggestedUsers(userId: string, limit = 10): Promise<SearchResult[]> {
  try {
    // Get users the current user is NOT following
    const { data: following } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = following?.map(f => f.following_id) || [];

    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, bio')
      .eq('profile_visibility', 'public')
      .not('id', 'in', `(${[userId, ...followingIds].join(',')})`)
      .limit(limit);

    if (!users) return [];

    return users.map(user => ({
      type: 'user' as const,
      id: user.id,
      title: user.display_name,
      subtitle: user.bio || undefined,
      image: user.avatar_url || undefined,
      url: `/profile/${user.id}`,
      data: user,
    }));
  } catch (error) {
    console.error('Failed to get suggested users:', error);
    return [];
  }
}

/**
 * Get trending recipes (most liked in past 30 days)
 */
export async function getTrendingRecipes(limit = 10): Promise<SearchResult[]> {
  try {
    // This is a simplified version - you might want to create a more complex query
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, description, image_url')
      .limit(limit);

    if (!recipes) return [];

    return recipes.map(recipe => ({
      type: 'recipe' as const,
      id: recipe.id,
      title: recipe.title,
      subtitle: recipe.description || undefined,
      image: recipe.image_url || undefined,
      url: `/recipes/${recipe.id}`,
      data: recipe,
    }));
  } catch (error) {
    console.error('Failed to get trending recipes:', error);
    return [];
  }
}
