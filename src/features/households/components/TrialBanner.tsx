import React from 'react';
import type { TrialStatus } from '@/types';
import './TrialBanner.css';

interface TrialBannerProps {
  trialStatus: TrialStatus;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ trialStatus }) => {
  // Don't show if not trial or not approaching end
  if (!trialStatus.is_trial || !trialStatus.needs_upgrade) {
    return null;
  }

  const isExpired = trialStatus.is_expired;
  const daysRemaining = trialStatus.days_remaining;

  // Determine urgency level
  let urgencyClass = '';
  if (isExpired) {
    urgencyClass = 'trial-banner-expired';
  } else if (daysRemaining <= 1) {
    urgencyClass = 'trial-banner-critical';
  } else if (daysRemaining <= 3) {
    urgencyClass = 'trial-banner-warning';
  } else {
    urgencyClass = 'trial-banner-info';
  }

  return (
    <div className={`trial-banner ${urgencyClass}`}>
      <div className="trial-banner-content">
        <div className="trial-banner-icon">
          {isExpired ? '⚠️' : '🎁'}
        </div>
        <div className="trial-banner-message">
          {isExpired ? (
            <>
              <strong>Your trial has expired.</strong>
              {' '}
              Upgrade now to continue using household features.
            </>
          ) : (
            <>
              <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</strong>
              {' '}
              in your free trial. Upgrade to keep sharing with your household.
            </>
          )}
        </div>
      </div>
      <button className="trial-banner-button">
        Upgrade Now
      </button>
    </div>
  );
};

export default TrialBanner;
