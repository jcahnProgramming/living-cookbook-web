import React, { useState } from 'react';
import './CreateHouseholdModal.css';

interface CreateHouseholdModalProps {
  onClose: () => void;
  onCreateHousehold: (name: string) => Promise<void>;
}

const CreateHouseholdModal: React.FC<CreateHouseholdModalProps> = ({ onClose, onCreateHousehold }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a household name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreateHousehold(name.trim());
      onClose();
    } catch (err) {
      setError('Failed to create household. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Household</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-description">
              Create a household to share meal plans and grocery lists with your family or roommates.
              You'll get a <strong>30-day free trial</strong> to try it out!
            </p>

            <div className="form-group">
              <label htmlFor="household-name">Household Name</label>
              <input
                id="household-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Smith Family, Apartment 4B"
                autoFocus
                maxLength={50}
              />
              <span className="form-hint">Choose a name everyone will recognize</span>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Household'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHouseholdModal;
