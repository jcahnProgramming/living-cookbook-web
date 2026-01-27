import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/plan', label: 'Plan', icon: '📅' },
    { path: '/grocery', label: 'Grocery', icon: '🛒' },
    { path: '/kitchen', label: 'My Kitchen', icon: '👨‍🍳' },
    { path: '/household', label: 'Household', icon: '👥' },
    { path: '/marketplace', label: 'Marketplace', icon: '🏪' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      {/* Header / Navigation */}
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">📖</span>
            <span className="logo-text">Living Cookbook</span>
          </Link>

          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link to="/settings" className="settings-button">
              ⚙️ Settings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2026 Living Cookbook. Made with ❤️ for home cooks.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
