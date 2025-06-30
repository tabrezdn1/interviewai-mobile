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

// Theme colors based on original web app
export const themes = {
  light: {
    // Backgrounds
    background: '#f8fafc', // Changed to match gradient start
    surface: '#ffffff',
    card: '#ffffff',
    cardSecondary: '#f1f5f9',
    
    // Gradients
    gradientBackground: ['#f8fafc', '#e0f2fe', '#f3e8ff'],
    
    // Primary colors with gradients
    primary: '#007AFF',
    primaryGradientStart: '#007AFF',
    primaryGradientEnd: '#5856D6',
    secondary: '#AF52DE',
    accent: '#5856D6',
    
    // Text colors
    text: '#1a1a1a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    
    // UI elements
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.1)',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Interactive elements
    button: '#007AFF',
    buttonHover: '#0056b3',
    buttonSecondary: '#f1f5f9',
    buttonSecondaryText: '#64748b',
    
    // Special elements
    placeholder: '#94a3b8',
    disabled: '#cbd5e1',
    divider: '#e2e8f0',
  },
  dark: {
    // Backgrounds
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    cardSecondary: '#334155',
    
    // Gradients
    gradientBackground: ['#0f172a', '#1e293b', '#334155'],
    
    // Primary colors with gradients
    primary: '#007AFF',
    primaryGradientStart: '#007AFF',
    primaryGradientEnd: '#5856D6',
    secondary: '#AF52DE',
    accent: '#5856D6',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#1a1a1a',
    
    // UI elements
    border: '#475569',
    borderLight: '#334155',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.3)',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Interactive elements
    button: '#007AFF',
    buttonHover: '#0056b3',
    buttonSecondary: '#334155',
    buttonSecondaryText: '#cbd5e1',
    
    // Special elements
    placeholder: '#64748b',
    disabled: '#475569',
    divider: '#334155',
  }
};

// Hook to get current theme colors
export const useThemeColors = () => {
  const { theme } = useThemeStore();
  return themes[theme];
};

// Helper function to create gradient styles
export const createGradient = (theme: Theme) => ({
  colors: [themes[theme].primaryGradientStart, themes[theme].primaryGradientEnd],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}); 