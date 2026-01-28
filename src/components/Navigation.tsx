import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  { path: '/plan', label: 'Plan', icon: '📅' },
  { path: '/grocery', label: 'Grocery', icon: '🛒' },
  { path: '/household', label: 'Household', icon: '👥' },
  { path: '/my-kitchen', label: 'My Kitchen', icon: '🔪' },
  { path: '/marketplace', label: 'Marketplace', icon: '🏪' },
];

const Navigation: React.FC = () => {
  const location = useLocation();

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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
