import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions - iPhone 13 Pro (390x844)
const baseWidth = 390;
const baseHeight = 844;

// Responsive width/height calculations
export const wp = (percentage: number): number => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

export const hp = (percentage: number): number => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive font sizing
export const rf = (size: number): number => {
  const scale = screenWidth / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive spacing system
export const spacing = {
  xs: wp(1),    // ~4px
  sm: wp(2),    // ~8px  
  md: wp(4),    // ~16px
  lg: wp(6),    // ~24px
  xl: wp(8),    // ~32px
  xxl: wp(10),  // ~40px
  xxxl: wp(12), // ~48px
};

// Typography scale
export const typography = {
  caption: rf(12),
  body: rf(14),
  bodyLarge: rf(16),
  subtitle: rf(18),
  title: rf(20),
  titleLarge: rf(24),
  headline: rf(28),
  headlineLarge: rf(32),
  display: rf(36),
};

// Touch target sizes (minimum 44px)
export const touchTarget = {
  small: Math.max(wp(10), 44),
  medium: Math.max(wp(12), 48),
  large: Math.max(wp(14), 56),
};

// Border radius scale
export const borderRadius = {
  sm: wp(2),
  md: wp(3),
  lg: wp(4),
  xl: wp(5),
  xxl: wp(6),
};

// Device type helpers
export const isSmallDevice = screenWidth < 375;
export const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
export const isLargeDevice = screenWidth >= 414;

// Safe area padding helpers
export const getSafeAreaPadding = (top: number, bottom: number, horizontal: number) => ({
  paddingTop: Math.max(top, spacing.lg),
  paddingBottom: Math.max(bottom, spacing.lg),
  paddingHorizontal: horizontal || spacing.lg,
});

// Responsive card dimensions
export const cardDimensions = {
  minHeight: hp(12),
  defaultPadding: spacing.lg,
  borderRadius: borderRadius.lg,
  shadowRadius: wp(2),
};

// Grid system
export const grid = {
  container: wp(6), // 24px on standard screen
  gutter: wp(3),    // 12px on standard screen
  columns: (cols: number) => (screenWidth - (grid.container * 2) - (grid.gutter * (cols - 1))) / cols,
}; 