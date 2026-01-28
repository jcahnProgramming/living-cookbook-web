import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeDebug: React.FC = () => {
  const { theme } = useTheme();
  const [computedColors, setComputedColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    setComputedColors({
      background: styles.getPropertyValue('--color-background'),
      surface: styles.getPropertyValue('--color-surface'),
      textPrimary: styles.getPropertyValue('--color-text-primary'),
      primary100: styles.getPropertyValue('--color-primary-100'),
      dataTheme: root.getAttribute('data-theme') || 'none',
    });
  }, [theme]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      padding: '12px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Theme Debug</strong></div>
      <div>Selected: {theme}</div>
      <div>data-theme: {computedColors.dataTheme}</div>
      <div>--color-background: {computedColors.background}</div>
      <div>--color-surface: {computedColors.surface}</div>
      <div>--color-text-primary: {computedColors.textPrimary}</div>
      <div>--color-primary-100: {computedColors.primary100}</div>
    </div>
  );
};

export default ThemeDebug;
