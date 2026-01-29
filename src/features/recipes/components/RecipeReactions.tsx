import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getRecipeReactions, 
  toggleReaction,
  type ReactionType,
  type ReactionCounts 
} from '@/features/recipes/recipeReactionsService';
import './RecipeReactions.css';

interface RecipeReactionsProps {
  recipeId: string;
}

const RecipeReactions: React.FC<RecipeReactionsProps> = ({ recipeId }) => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({
    thumbs_up_count: 0,
    thumbs_down_count: 0,
    love_count: 0,
    total_reactions: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [recipeId, user?.id]);

  const loadReactions = async () => {
    const data = await getRecipeReactions(recipeId, user?.id);
    setCounts(data.counts);
    setUserReaction(data.userReaction);
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user?.id) {
      alert('Please sign in to react to recipes');
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await toggleReaction(recipeId, user.id, reactionType);
      await loadReactions();
    } catch (error) {
      console.error('Failed to update reaction:', error);
      alert('Failed to update reaction. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="recipe-reactions">
      <div className="reactions-label">What did you think?</div>
      <div className="reactions-buttons">
        <button
          onClick={() => handleReaction('thumbs_up')}
          className={`reaction-btn ${userReaction === 'thumbs_up' ? 'active' : ''}`}
          disabled={isUpdating}
          title="Thumbs up"
        >
          <span className="reaction-icon">👍</span>
          <span className="reaction-count">{counts.thumbs_up_count}</span>
        </button>

        <button
          onClick={() => handleReaction('thumbs_down')}
          className={`reaction-btn ${userReaction === 'thumbs_down' ? 'active' : ''}`}
          disabled={isUpdating}
          title="Thumbs down"
        >
          <span className="reaction-icon">👎</span>
          <span className="reaction-count">{counts.thumbs_down_count}</span>
        </button>

        <button
          onClick={() => handleReaction('love')}
          className={`reaction-btn ${userReaction === 'love' ? 'active' : ''}`}
          disabled={isUpdating}
          title="Love it!"
        >
          <span className="reaction-icon">❤️</span>
          <span className="reaction-count">{counts.love_count}</span>
        </button>
      </div>
      
      {counts.total_reactions > 0 && (
        <div className="reactions-total">
          {counts.total_reactions} {counts.total_reactions === 1 ? 'reaction' : 'reactions'}
        </div>
      )}
    </div>
  );
};

export default RecipeReactions;
