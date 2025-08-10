// src/contexts/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('codecollab-theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark'; // Default to dark theme
  });

  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem('codecollab-font-size');
    const parsedSize = savedFontSize ? parseInt(savedFontSize) : 14;
    return Math.min(Math.max(parsedSize, 12), 24); // Clamp between 12-24
  });

  const [codeFont, setCodeFont] = useState(() => {
    const savedCodeFont = localStorage.getItem('codecollab-code-font');
    return savedCodeFont || 'JetBrains Mono';
  });

  const [uiFont, setUiFont] = useState(() => {
    const savedUiFont = localStorage.getItem('codecollab-ui-font');
    return savedUiFont || 'Inter';
  });

  // Available themes
  const themes = {
    dark: {
      name: 'Dark',
      description: 'Easy on the eyes with deep blues and purples',
      colors: {
        bgPrimary: '#0f0f23',
        bgSecondary: '#1a1a3a',
        bgTertiary: '#262640',
        accentPrimary: '#667eea',
        accentSecondary: '#764ba2',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0c0',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    },
    light: {
      name: 'Light',
      description: 'Clean and bright for daytime coding',
      colors: {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8fafc',
        bgTertiary: '#e2e8f0',
        accentPrimary: '#667eea',
        accentSecondary: '#764ba2',
        textPrimary: '#1a202c',
        textSecondary: '#4a5568',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    }
  };

  // Font options
  const fontOptions = {
    ui: [
      { 
        name: 'Inter', 
        value: 'Inter',
        description: 'Modern and readable sans-serif',
        preview: 'The quick brown fox jumps over the lazy dog'
      },
      { 
        name: 'System', 
        value: 'system-ui',
        description: 'Your system\'s default font',
        preview: 'The quick brown fox jumps over the lazy dog'
      },
      { 
        name: 'Roboto', 
        value: 'Roboto',
        description: 'Google\'s signature font',
        preview: 'The quick brown fox jumps over the lazy dog'
      },
    ],
    code: [
      { 
        name: 'JetBrains Mono', 
        value: 'JetBrains Mono',
        description: 'Designed for developers with ligatures',
        preview: 'const hello = () => { return "world"; }'
      },
      { 
        name: 'Fira Code', 
        value: 'Fira Code',
        description: 'Popular programming font with ligatures',
        preview: 'const hello = () => { return "world"; }'
      },
      { 
        name: 'SF Mono', 
        value: 'SF Mono',
        description: 'Apple\'s monospace font',
        preview: 'const hello = () => { return "world"; }'
      },
      { 
        name: 'Monaco', 
        value: 'Monaco',
        description: 'Classic Mac development font',
        preview: 'const hello = () => { return "world"; }'
      },
      { 
        name: 'Consolas', 
        value: 'Consolas',
        description: 'Microsoft\'s clear monospace font',
        preview: 'const hello = () => { return "world"; }'
      },
    ]
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themes[theme].colors.bgPrimary);
    }
    
    // Update body class for any CSS that needs it
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    localStorage.setItem('codecollab-theme', theme);
  }, [theme, themes]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
    localStorage.setItem('codecollab-font-size', fontSize.toString());
  }, [fontSize]);

  // Apply code font
  useEffect(() => {
    const fontStack = `'${codeFont}', 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, monospace`;
    document.documentElement.style.setProperty('--editor-font-family', fontStack);
    localStorage.setItem('codecollab-code-font', codeFont);
  }, [codeFont]);

  // Apply UI font
  useEffect(() => {
    const fontStack = `'${uiFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    document.documentElement.style.setProperty('--ui-font-family', fontStack);
    document.body.style.fontFamily = fontStack;
    localStorage.setItem('codecollab-ui-font', uiFont);
  }, [uiFont]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('codecollab-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };

    // Check if the browser supports this API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Theme management functions
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateFontSize = (size) => {
    const clampedSize = Math.min(Math.max(parseInt(size), 12), 24);
    setFontSize(clampedSize);
  };

  const incrementFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };

  const decrementFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12));
  };

  const resetFontSize = () => {
    setFontSize(14);
  };

  const updateCodeFont = (font) => {
    setCodeFont(font);
  };

  const updateUiFont = (font) => {
    setUiFont(font);
  };

  const getCurrentTheme = () => themes[theme];

  // Get computed theme colors (useful for dynamic styling)
  const getThemeColors = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      bgPrimary: computedStyle.getPropertyValue('--bg-primary').trim(),
      bgSecondary: computedStyle.getPropertyValue('--bg-secondary').trim(),
      bgTertiary: computedStyle.getPropertyValue('--bg-tertiary').trim(),
      accentPrimary: computedStyle.getPropertyValue('--accent-primary').trim(),
      accentSecondary: computedStyle.getPropertyValue('--accent-secondary').trim(),
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
      success: computedStyle.getPropertyValue('--success').trim(),
      error: computedStyle.getPropertyValue('--error').trim(),
      warning: computedStyle.getPropertyValue('--warning').trim(),
    };
  };

  // Reset all settings to defaults
  const resetToDefaults = () => {
    setTheme('dark');
    setFontSize(14);
    setCodeFont('JetBrains Mono');
    setUiFont('Inter');
    
    // Clear localStorage
    localStorage.removeItem('codecollab-theme');
    localStorage.removeItem('codecollab-font-size');
    localStorage.removeItem('codecollab-code-font');
    localStorage.removeItem('codecollab-ui-font');
  };

  // Export theme settings (for backup/sync)
  const exportSettings = () => {
    return {
      theme,
      fontSize,
      codeFont,
      uiFont,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  };

  // Import theme settings (for backup/sync)
  const importSettings = (settings) => {
    try {
      if (settings.theme && themes[settings.theme]) {
        setTheme(settings.theme);
      }
      if (settings.fontSize && settings.fontSize >= 12 && settings.fontSize <= 24) {
        setFontSize(settings.fontSize);
      }
      if (settings.codeFont) {
        setCodeFont(settings.codeFont);
      }
      if (settings.uiFont) {
        setUiFont(settings.uiFont);
      }
      return true;
    } catch (error) {
      console.error('Failed to import theme settings:', error);
      return false;
    }
  };

  // Check if settings are different from defaults
  const hasCustomSettings = () => {
    return (
      theme !== 'dark' ||
      fontSize !== 14 ||
      codeFont !== 'JetBrains Mono' ||
      uiFont !== 'Inter'
    );
  };

  // Theme transition effect
  const enableTransitions = () => {
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');
  };

  const disableTransitions = () => {
    document.documentElement.style.setProperty('--theme-transition', 'none');
  };

  const value = {
    // Current state
    theme,
    fontSize,
    codeFont,
    uiFont,
    
    // Theme data
    themes,
    fontOptions,
    currentTheme: getCurrentTheme(),
    
    // Actions
    toggleTheme,
    setTheme,
    updateFontSize,
    incrementFontSize,
    decrementFontSize,
    resetFontSize,
    updateCodeFont,
    updateUiFont,
    
    // Utility functions
    isDark: theme === 'dark',
    isLight: theme === 'light',
    getThemeColors,
    
    // Settings management
    resetToDefaults,
    exportSettings,
    importSettings,
    hasCustomSettings,
    
    // Transition control
    enableTransitions,
    disableTransitions,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Higher-order component for theme-aware components
export const withTheme = (Component) => {
  return (props) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

// Custom hook for theme-aware styling
export const useThemeStyles = () => {
  const { currentTheme, fontSize, codeFont, uiFont, getThemeColors } = useTheme();
  
  return {
    colors: currentTheme.colors,
    computedColors: getThemeColors(),
    fontSize,
    codeFont,
    uiFont,
    
    // Pre-built style objects
    cardStyle: {
      backgroundColor: currentTheme.colors.bgSecondary,
      borderColor: currentTheme.colors.bgTertiary,
      color: currentTheme.colors.textPrimary,
    },
    
    buttonPrimaryStyle: {
      backgroundColor: currentTheme.colors.accentPrimary,
      color: '#ffffff',
    },
    
    buttonSecondaryStyle: {
      backgroundColor: currentTheme.colors.bgTertiary,
      color: currentTheme.colors.textPrimary,
      borderColor: currentTheme.colors.bgTertiary,
    },
    
    editorStyle: {
      fontSize: `${fontSize}px`,
      fontFamily: `'${codeFont}', monospace`,
      backgroundColor: currentTheme.colors.bgTertiary,
      color: currentTheme.colors.textPrimary,
    },
    
    inputStyle: {
      backgroundColor: currentTheme.colors.bgSecondary,
      borderColor: currentTheme.colors.bgTertiary,
      color: currentTheme.colors.textPrimary,
    },
  };
};

// Custom hook for responsive theme behavior
export const useResponsiveTheme = () => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return {
    ...theme,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    
    // Mobile-specific theme adjustments
    mobileFontSize: isMobile ? Math.max(theme.fontSize - 2, 12) : theme.fontSize,
    
    // Responsive utilities
    getResponsiveValue: (mobile, tablet, desktop) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },
  };
};

// Custom hook for theme animation controls
export const useThemeTransitions = () => {
  const { enableTransitions, disableTransitions } = useTheme();

  const withoutTransition = (callback) => {
    disableTransitions();
    callback();
    // Re-enable transitions after a brief delay
    setTimeout(enableTransitions, 50);
  };

  return {
    enableTransitions,
    disableTransitions,
    withoutTransition,
  };
};

// Custom hook for system theme detection
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'light' : 'dark');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return systemTheme;
};

export default ThemeContext;