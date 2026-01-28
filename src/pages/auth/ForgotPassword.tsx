import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatAuthError } from '@/lib/auth';
import './Auth.css';

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">✉️</div>
            <h1>Check Your Email</h1>
            <p>We've sent you a password reset link</p>
          </div>

          <div className="success-message">
            If an account exists with <strong>{email}</strong>, you will receive a password reset email shortly.
            Please check your inbox and follow the instructions.
          </div>

          <Link to="/auth/login" className="btn-secondary btn-full">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/auth/login" className="auth-link">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
