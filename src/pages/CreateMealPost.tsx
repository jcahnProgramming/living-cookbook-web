import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { createMealPost } from '@/features/meals/mealPostsService';
import './CreateMealPost.css';

interface Recipe {
  id: string;
  title: string;
  author_display_name: string;
  author_source: string;
  images?: any;
}

interface RecipeReactions {
  thumbs_up: number;
  thumbs_down: number;
  love: number;
}

const CreateMealPost: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipeId } = location.state || {};

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [reactions, setReactions] = useState<RecipeReactions>({ thumbs_up: 0, thumbs_down: 0, love: 0 });
  const [caption, setCaption] = useState('');
  const [cookedDate, setCookedDate] = useState(new Date().toISOString().split('T')[0]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecipeCard, setShowRecipeCard] = useState(true);

  useEffect(() => {
    if (recipeId) {
      loadRecipeDetails();
      loadRecipeReactions();
    }
  }, [recipeId]);

  const loadRecipeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, author_display_name, author_source, images')
        .eq('id', recipeId)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  const loadRecipeReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_reactions')
        .select('reaction_type')
        .eq('recipe_id', recipeId);

      if (error) throw error;

      const counts = {
        thumbs_up: data?.filter(r => r.reaction_type === 'thumbs_up').length || 0,
        thumbs_down: data?.filter(r => r.reaction_type === 'thumbs_down').length || 0,
        love: data?.filter(r => r.reaction_type === 'love').length || 0,
      };

      setReactions(counts);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 photos
    const newPhotos = [...selectedPhotos, ...files].slice(0, 5);
    setSelectedPhotos(newPhotos);

    // Create preview URLs
    const newPreviewUrls = newPhotos.map(file => URL.createObjectURL(file));
    
    // Revoke old URLs
    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setPhotoPreviewUrls(newPreviewUrls);
  };

  const removePhoto = (index: number) => {
    const newPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(newPhotos);

    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(newPreviewUrls);
  };

//   const uploadPhotos = async (): Promise<string[]> {
//     const uploadedUrls: string[] = [];
// 
//     for (const photo of selectedPhotos) {
//       try {
//         const fileExt = photo.name.split('.').pop();
//         const fileName = `${Math.random()}.${fileExt}`;
//         const filePath = `meal-posts/${fileName}`;
// 
//         const { error: uploadError } = await supabase.storage
//           .from('meal-photos')
//           .upload(filePath, photo);
// 
//         if (uploadError) {
//           console.error('Upload error:', uploadError);
//           // Continue without this photo
//           continue;
//         }
// 
//         const { data: { publicUrl } } = supabase.storage
//           .from('meal-photos')
//           .getPublicUrl(filePath);
// 
//         uploadedUrls.push(publicUrl);
//       } catch (error) {
//         console.error('Failed to upload photo:', error);
//         // Continue without this photo
//       }
//     }
// 
//     return uploadedUrls;
//   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Skip photo upload for now (bucket not configured)
      const photoUrls: string[] = [];

      // Create meal post
      await createMealPost(user.id, {
        recipe_id: recipeId || undefined,
        caption: caption || undefined,
        cooked_date: cookedDate,
        visibility,
        photo_urls: photoUrls,
      });

      // Navigate to feed
      navigate('/feed');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecipeImage = () => {
    if (recipe?.images && Array.isArray(recipe.images) && recipe.images.length > 0) {
      return recipe.images[0].url || recipe.images[0];
    }
    return null;
  };

  const getAuthorLabel = () => {
    if (!recipe) return '';
    
    if (recipe.author_source === 'marketplace') {
      return `from ${recipe.author_display_name} Pack`;
    }
    if (recipe.author_source === 'user_generated') {
      return `by ${recipe.author_display_name}`;
    }
    return `by ${recipe.author_display_name}`;
  };

  return (
    <div className="create-meal-post">
      <div className="create-post-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Share Your Meal</h1>
        <div className="spacer" />
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Photo Upload Section */}
        <div className="photo-upload-section">
          <h3>Add Photos</h3>
          <div className="photo-grid">
            {photoPreviewUrls.map((url, index) => (
              <div key={index} className="photo-preview">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="remove-photo"
                >
                  ✕
                </button>
              </div>
            ))}
            {selectedPhotos.length < 5 && (
              <label className="photo-upload-button">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span>Add Photo</span>
                </div>
              </label>
            )}
          </div>
          <p className="photo-hint">Add up to 5 photos (optional)</p>
        </div>

        {/* Recipe Card (if recipe selected) */}
        {recipe && showRecipeCard && (
          <div className="recipe-card-section">
            <div className="recipe-card">
              <button
                type="button"
                onClick={() => setShowRecipeCard(false)}
                className="remove-recipe"
                title="Remove recipe"
              >
                ✕
              </button>
              
              <div className="recipe-card-content">
                {getRecipeImage() && (
                  <div className="recipe-card-image">
                    <img src={getRecipeImage()} alt={recipe.title} />
                  </div>
                )}
                
                <div className="recipe-card-info">
                  <h4 className="recipe-card-title">{recipe.title}</h4>
                  
                  <p className="recipe-card-author">
                    {getAuthorLabel()}
                  </p>

                  <div className="recipe-reactions">
                    <span className="reaction-item">
                      <span className="reaction-icon">👍</span>
                      <span className="reaction-count">{reactions.thumbs_up}</span>
                    </span>
                    <span className="reaction-item">
                      <span className="reaction-icon">👎</span>
                      <span className="reaction-count">{reactions.thumbs_down}</span>
                    </span>
                    <span className="reaction-item">
                      <span className="reaction-icon">❤️</span>
                      <span className="reaction-count">{reactions.love}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                    className="view-recipe-button"
                  >
                    View Recipe →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Caption */}
        <div className="form-group">
          <label htmlFor="caption">Caption (optional)</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="How did it turn out? Any tips to share?"
            rows={4}
            maxLength={1000}
          />
          <span className="char-count">{caption.length}/1000</span>
        </div>

        {/* Cooked Date */}
        <div className="form-group">
          <label htmlFor="cookedDate">When did you cook this?</label>
          <input
            type="date"
            id="cookedDate"
            value={cookedDate}
            onChange={(e) => setCookedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Visibility */}
        <div className="form-group">
          <label>Who can see this post?</label>
          <div className="visibility-options">
            <label className="visibility-option">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={(e) => setVisibility(e.target.value as any)}
              />
              <span className="visibility-label">
                <span className="visibility-icon">🌍</span>
                <span>
                  <strong>Public</strong>
                  <small>Anyone can see</small>
                </span>
              </span>
            </label>

            <label className="visibility-option">
              <input
                type="radio"
                name="visibility"
                value="friends"
                checked={visibility === 'friends'}
                onChange={(e) => setVisibility(e.target.value as any)}
              />
              <span className="visibility-label">
                <span className="visibility-icon">👥</span>
                <span>
                  <strong>Friends</strong>
                  <small>Only friends can see</small>
                </span>
              </span>
            </label>

            <label className="visibility-option">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={(e) => setVisibility(e.target.value as any)}
              />
              <span className="visibility-label">
                <span className="visibility-icon">🔒</span>
                <span>
                  <strong>Private</strong>
                  <small>Only you can see</small>
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Share Meal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMealPost;
