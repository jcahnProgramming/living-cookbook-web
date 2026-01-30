import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  profile_visibility: 'public' | 'friends' | 'private';
  dietary_preferences?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  created_at: string;
  recipes_created?: number;
  recipes_favorited?: number;
}

export interface UpdateProfileData {
  display_name?: string;
  bio?: string;
  location?: string;
  profile_visibility?: 'public' | 'friends' | 'private';
  dietary_preferences?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Get user basic info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!userData) return null;

    // Check if we can view this profile (public or own profile)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const canView = userData.profile_visibility === 'public' || currentUser?.id === userId;
    
    if (!canView) {
      return null;
    }

    // Get recipe count
    const { count: recipesCreated } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_user_created', true);

    // Get favorites count
    const { count: recipesFavorited } = await supabase
      .from('recipe_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      id: userData.id,
      email: userData.email,
      display_name: userData.display_name,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      profile_visibility: userData.profile_visibility || 'public',
      dietary_preferences: userData.dietary_preferences,
      social_links: userData.social_links,
      created_at: userData.created_at,
      recipes_created: recipesCreated || 0,
      recipes_favorited: recipesFavorited || 0,
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

/**
 * Get current user's profile
 */
export async function getMyProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return getUserProfile(user.id);
  } catch (error) {
    console.error('Failed to get current user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: UpdateProfileData
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);

    // Update user record
    await updateProfile(userId, { avatar_url: data.publicUrl } as any);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    throw error;
  }
}

/**
 * Search users by display name
 */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('profile_visibility', 'public')
      .ilike('display_name', `%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to search users:', error);
    return [];
  }
}
