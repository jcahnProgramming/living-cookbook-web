import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createMealPost, uploadMealPhoto } from '@/features/meals/mealPostsService';
import './CreateMealPost.css';

const CreateMealPost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('recipe');

  const [caption, setCaption] = useState('');
  const [cookedDate, setCookedDate] = useState(new Date().toISOString().split('T')[0]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removePhoto = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    if (selectedFiles.length === 0) {
      setError('Please add at least one photo');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Upload all photos
      const photoUrls = await Promise.all(
        selectedFiles.map(file => uploadMealPhoto(user.id, file))
      );

      // Create meal post
      await createMealPost(user.id, {
        recipe_id: recipeId || undefined,
        caption: caption.trim() || undefined,
        cooked_date: cookedDate,
        visibility,
        photo_urls: photoUrls,
      });

      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));

      // Navigate to profile
      navigate('/profile');
    } catch (err: any) {
      console.error('Failed to create meal post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-meal-post">
      <div className="create-meal-header">
        <h1>Share Your Meal</h1>
        <p>Post photos of what you cooked</p>
      </div>

      <form onSubmit={handleSubmit} className="meal-post-form">
        {/* Photo Upload */}
        <div className="form-section">
          <label className="form-label">Photos *</label>
          <p className="form-hint">Add 1-5 photos of your meal</p>

          <div className="photo-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="photo-preview">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="btn-remove-photo"
                >
                  ✕
                </button>
              </div>
            ))}

            {selectedFiles.length < 5 && (
              <label className="photo-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <div className="upload-icon">📸</div>
                <div className="upload-text">Add Photo</div>
              </label>
            )}
          </div>
        </div>

        {/* Caption */}
        <div className="form-section">
          <label htmlFor="caption" className="form-label">Caption</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What did you think? Any modifications?"
            rows={4}
            maxLength={500}
          />
          <div className="char-count">{caption.length}/500</div>
        </div>

        {/* Date Cooked */}
        <div className="form-section">
          <label htmlFor="cookedDate" className="form-label">Date Cooked</label>
          <input
            type="date"
            id="cookedDate"
            value={cookedDate}
            onChange={(e) => setCookedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Visibility */}
        <div className="form-section">
          <label className="form-label">Who can see this?</label>
          <div className="visibility-options">
            <label className="visibility-option">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              <div>
                <div className="option-title">🌍 Public</div>
                <div className="option-desc">Anyone can see this post</div>
              </div>
            </label>

            <label className="visibility-option">
              <input
                type="radio"
                name="visibility"
                value="friends"
                checked={visibility === 'friends'}
                onChange={() => setVisibility('friends')}
              />
              <div>
                <div className="option-title">👥 Friends Only</div>
                <div className="option-desc">Only your friends can see this</div>
              </div>
            </label>

            <label className="visibility-option">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              <div>
                <div className="option-title">🔒 Private</div>
                <div className="option-desc">Only you can see this</div>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? 'Posting...' : 'Share Meal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMealPost;
