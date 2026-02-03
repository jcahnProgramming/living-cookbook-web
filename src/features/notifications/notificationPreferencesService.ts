import { supabase } from '@/lib/supabase';

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  email_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  push_enabled: boolean;
  notify_friend_requests: boolean;
  notify_friend_accepted: boolean;
  notify_new_follower: boolean;
  notify_post_liked: boolean;
  notify_post_commented: boolean;
  notify_comment_reply: boolean;
  notify_mentioned: boolean;
  notify_post_shared: boolean;
  notify_weekly_recap: boolean;
  notify_product_updates: boolean;
  notify_tips_tricks: boolean;
  updated_at: string;
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If no preferences exist, create defaults
    if (!data) {
      return await createDefaultPreferences(userId);
    }

    return data;
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return null;
  }
}

/**
 * Create default notification preferences
 */
async function createDefaultPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const defaults: Partial<NotificationPreferences> = {
      user_id: userId,
      email_enabled: true,
      email_frequency: 'instant',
      push_enabled: true,
      notify_friend_requests: true,
      notify_friend_accepted: true,
      notify_new_follower: true,
      notify_post_liked: true,
      notify_post_commented: true,
      notify_comment_reply: true,
      notify_mentioned: true,
      notify_post_shared: true,
      notify_weekly_recap: true,
      notify_product_updates: false,
      notify_tips_tricks: false,
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert(defaults)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create default preferences:', error);
    return null;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
}

/**
 * Check if user should receive notification
 */
export async function shouldNotify(
  userId: string,
  notificationType: keyof NotificationPreferences
): Promise<boolean> {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs) return true; // Default to sending if no preferences

    return prefs[notificationType] as boolean;
  } catch (error) {
    console.error('Failed to check notification preference:', error);
    return true; // Default to sending on error
  }
}

/**
 * Disable all notifications
 */
export async function disableAllNotifications(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        email_enabled: false,
        push_enabled: false,
        notify_friend_requests: false,
        notify_friend_accepted: false,
        notify_new_follower: false,
        notify_post_liked: false,
        notify_post_commented: false,
        notify_comment_reply: false,
        notify_mentioned: false,
        notify_post_shared: false,
        notify_weekly_recap: false,
        notify_product_updates: false,
        notify_tips_tricks: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to disable all notifications:', error);
    throw error;
  }
}

/**
 * Enable all notifications
 */
export async function enableAllNotifications(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        email_enabled: true,
        push_enabled: true,
        notify_friend_requests: true,
        notify_friend_accepted: true,
        notify_new_follower: true,
        notify_post_liked: true,
        notify_post_commented: true,
        notify_comment_reply: true,
        notify_mentioned: true,
        notify_post_shared: true,
        notify_weekly_recap: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to enable all notifications:', error);
    throw error;
  }
}
