import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getAvailableAvatars, type AvailableAvatar } from '@/features/users/userProfileService';
import './AvatarPicker.css';

interface Props {
  currentAvatarUrl?: string;
  currentAvatarSource?: string;
  onSelect: (avatarUrl: string, source: string) => void;
}

const AvatarPicker: React.FC<Props> = ({ currentAvatarUrl, currentAvatarSource = 'custom', onSelect }) => {
  const { user } = useAuth();
  const [availableAvatars, setAvailableAvatars] = useState<AvailableAvatar[]>([]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(currentAvatarUrl || '');
  const [selectedSource, setSelectedSource] = useState(currentAvatarSource);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadAvailableAvatars();
  }, [user?.id]);

  const loadAvailableAvatars = async () => {
    if (!user?.id) return;

    try {
      const avatars = await getAvailableAvatars(user.id);
      setAvailableAvatars(avatars);
    } catch (error) {
      console.error('Failed to load social avatars:', error);
    }
  };

  const handleSelect = (url: string, source: string) => {
    setSelectedSource(source);
    onSelect(url, source);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      // Save as custom avatar
      setCustomAvatarUrl(publicUrl);
      handleSelect(publicUrl, 'custom');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="avatar-picker">
      <div className="avatar-picker-header">
        <h3>Profile Picture</h3>
        <p>Choose from your connected accounts or upload a custom image</p>
      </div>

      {/* Current Selected Avatar */}
      <div className="current-avatar-preview">
        <div className="avatar-large">
          {(selectedSource === 'custom' && customAvatarUrl) || 
           availableAvatars.find(a => a.source === selectedSource)?.url ? (
            <img 
              src={selectedSource === 'custom' ? customAvatarUrl : availableAvatars.find(a => a.source === selectedSource)?.url} 
              alt="Current avatar" 
            />
          ) : (
            <div className="avatar-placeholder-large">
              {user?.user_metadata?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="avatar-label">
          {selectedSource === 'custom' ? 'Custom Upload' : availableAvatars.find(a => a.source === selectedSource)?.provider || 'No avatar selected'}
        </div>
      </div>

      {/* Available Social Avatars */}
      {availableAvatars.length > 0 && (
        <div className="avatar-section">
          <h4>Connected Accounts</h4>
          <div className="avatar-options">
            {availableAvatars.map((avatar) => (
              <button
                key={avatar.source}
                onClick={() => handleSelect(avatar.url, avatar.source)}
                className={`avatar-option ${selectedSource === avatar.source ? 'selected' : ''}`}
              >
                <img src={avatar.url} alt={avatar.provider} />
                <span className="avatar-label">{avatar.provider}</span>
                {selectedSource === avatar.source && (
                  <div className="selected-badge">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Upload Section */}
      {customAvatarUrl && (
        <div className="avatar-section">
          <h4>Custom Upload</h4>
          <div className="avatar-options">
            <button
              onClick={() => handleSelect(customAvatarUrl, 'custom')}
              className={`avatar-option ${selectedSource === 'custom' ? 'selected' : ''}`}
            >
              <img src={customAvatarUrl} alt="Custom" />
              <span className="avatar-label">Custom</span>
              {selectedSource === 'custom' && (
                <div className="selected-badge">✓</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="avatar-upload">
        <label htmlFor="avatar-upload" className="btn-upload">
          {isUploading ? 'Uploading...' : '📤 Upload New Image'}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <p className="upload-hint">JPG, PNG or GIF (max 2MB)</p>
      </div>

      {availableAvatars.length === 0 && !customAvatarUrl && !isUploading && (
        <div className="no-avatars">
          <p>Connect social accounts in Settings to use their profile pictures, or upload a custom image.</p>
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;
