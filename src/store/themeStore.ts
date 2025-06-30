import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light', // Default to light theme
  setTheme: (theme: Theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
}));

// Enhanced theme colors for mobile
export const themes = {
  light: {
    // Backgrounds with better mobile contrast
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    cardSecondary: '#f1f5f9',
    cardElevated: '#ffffff',
    
    // Gradients optimized for mobile
    gradientBackground: ['#f8fafc', '#e0f2fe', '#f3e8ff'],
    primaryGradient: ['#007AFF', '#5856D6'],
    secondaryGradient: ['#AF52DE', '#FF6B6B'],
    
    // Primary colors with better mobile visibility
    primary: '#007AFF',
    primaryLight: '#4FC3F7',
    primaryDark: '#0056CC',
    secondary: '#AF52DE',
    accent: '#5856D6',
    
    // Text colors with improved contrast
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textQuaternary: '#94a3b8',
    textInverse: '#ffffff',
    textMuted: '#cbd5e1',
    
    // UI elements optimized for touch
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderStrong: '#cbd5e1',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.1)',
    overlayStrong: 'rgba(0, 0, 0, 0.3)',
    
    // Status colors with better accessibility
    success: '#22c55e',
    successLight: '#86efac',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#fca5a5',
    info: '#3b82f6',
    infoLight: '#93c5fd',
    
    // Interactive elements
    button: '#007AFF',
    buttonHover: '#0056CC',
    buttonPressed: '#004AA6',
    buttonSecondary: '#f1f5f9',
    buttonSecondaryText: '#475569',
    buttonDisabled: '#e2e8f0',
    
    // Form elements
    input: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocused: '#007AFF',
    placeholder: '#9ca3af',
    
    // Special elements
    disabled: '#cbd5e1',
    divider: '#f1f5f9',
    skeleton: '#f3f4f6',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    // Backgrounds optimized for dark mode
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    cardSecondary: '#334155',
    cardElevated: '#2d3748',
    
    // Gradients for dark mode
    gradientBackground: ['#0f172a', '#1e293b', '#334155'],
    primaryGradient: ['#007AFF', '#5856D6'],
    secondaryGradient: ['#AF52DE', '#FF6B6B'],
    
    // Primary colors adjusted for dark mode
    primary: '#0ea5e9',
    primaryLight: '#38bdf8',
    primaryDark: '#0284c7',
    secondary: '#c084fc',
    accent: '#8b5cf6',
    
    // Text colors with better dark mode contrast
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textQuaternary: '#64748b',
    textInverse: '#0f172a',
    textMuted: '#6b7280',
    
    // UI elements for dark mode
    border: '#374151',
    borderLight: '#4b5563',
    borderStrong: '#6b7280',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.3)',
    overlayStrong: 'rgba(0, 0, 0, 0.7)',
    
    // Status colors for dark mode
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    
    // Interactive elements for dark mode
    button: '#0ea5e9',
    buttonHover: '#0284c7',
    buttonPressed: '#0369a1',
    buttonSecondary: '#374151',
    buttonSecondaryText: '#cbd5e1',
    buttonDisabled: '#4b5563',
    
    // Form elements for dark mode
    input: '#374151',
    inputBorder: '#4b5563',
    inputFocused: '#0ea5e9',
    placeholder: '#6b7280',
    
    // Special elements for dark mode
    disabled: '#4b5563',
    divider: '#374151',
    skeleton: '#374151',
    backdrop: 'rgba(0, 0, 0, 0.8)',
  }
};

// Hook to get current theme colors
export const useThemeColors = () => {
  const { theme } = useThemeStore();
  return themes[theme];
};

// Helper function to create gradient styles
export const createGradient = (theme: Theme, type: 'primary' | 'secondary' | 'background' = 'primary') => {
  const themeColors = themes[theme];
  let colors: string[];
  
  switch (type) {
    case 'primary':
      colors = themeColors.primaryGradient;
      break;
    case 'secondary':
      colors = themeColors.secondaryGradient;
      break;
    case 'background':
      colors = themeColors.gradientBackground;
      break;
    default:
      colors = themeColors.primaryGradient;
  }
  
  return {
    colors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };
};

// Elevation/shadow helper for mobile
export const getElevation = (level: number, theme: Theme) => {
  const baseColor = theme === 'dark' ? '#000000' : '#000000';
  const elevations = [
    // Level 0 - No elevation
    {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    // Level 1 - Subtle elevation
    {
      shadowColor: baseColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    // Level 2 - Card elevation
    {
      shadowColor: baseColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'dark' ? 0.4 : 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    // Level 3 - Modal elevation
    {
      shadowColor: baseColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme === 'dark' ? 0.5 : 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    // Level 4 - Floating element
    {
      shadowColor: baseColor,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: theme === 'dark' ? 0.6 : 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  ];
  
  return elevations[Math.min(level, elevations.length - 1)];
}; 