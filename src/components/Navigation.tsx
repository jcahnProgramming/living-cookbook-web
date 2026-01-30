import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './Navigation.css';

interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/library', label: 'Library', icon: '📚' },
  { path: '/favorites', label: 'Favorites', icon: '❤️' },
  { path: '/plan', label: 'Plan', icon: '📅' },
  { path: '/grocery', label: 'Grocery', icon: '🛒' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/household', label: 'Household', icon: '👥' },
  { path: '/my-kitchen', label: 'My Kitchen', icon: '🔪' },
  { path: '/marketplace', label: 'Marketplace', icon: '🏪' },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="navigation">
      <div className="navigation__container">
        <div className="navigation__brand">
          <Link to="/" className="navigation__logo">
            <span className="navigation__logo-icon">🍳</span>
            <span className="navigation__logo-text">Living Cookbook</span>
          </Link>
        </div>

        <div className="navigation__items">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navigation__link ${
                location.pathname === item.path ? 'navigation__link--active' : ''
              }`}
            >
              {item.icon && <span className="navigation__link-icon">{item.icon}</span>}
              <span className="navigation__link-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navigation__actions">
          <ThemeSwitcher />
          <Link to="/settings" className="navigation__settings-button" aria-label="Settings">
            <span>⚙️</span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="navigation__signout-button"
            aria-label="Sign Out"
            title={`Sign out (${user?.email})`}
          >
            <span>🚪</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
