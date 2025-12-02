/**
 * Responsive layout utilities for cross-platform UI
 * Provides helpers for adapting UI to different screen sizes and platforms
 */

import { Dimensions, Platform } from 'react-native';

export interface ScreenSize {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Get current screen size information
 */
export function getScreenSize(): ScreenSize {
  const { width, height } = Dimensions.get('window');
  const isPortrait = height > width;
  
  return {
    width,
    height,
    isSmall: width < 600,
    isMedium: width >= 600 && width < 1024,
    isLarge: width >= 1024,
    isPortrait,
    isLandscape: !isPortrait,
  };
}

/**
 * Get responsive value based on screen size
 * @param small Value for small screens (< 600px)
 * @param medium Value for medium screens (600-1024px)
 * @param large Value for large screens (>= 1024px)
 */
export function getResponsiveValue<T>(small: T, medium: T, large: T): T {
  const { isSmall, isMedium } = getScreenSize();
  
  if (isSmall) return small;
  if (isMedium) return medium;
  return large;
}

/**
 * Get optimal column count for grid layouts
 */
export function getColumnCount(): number {
  return getResponsiveValue(1, 2, 3);
}

/**
 * Get optimal content width for reading
 * Prevents text from being too wide on large screens
 */
export function getMaxContentWidth(): number {
  const { width } = getScreenSize();
  
  if (Platform.OS === 'web') {
    // On web, limit content width for better readability
    return Math.min(width, 1200);
  }
  
  return width;
}

/**
 * Get optimal touch target size
 * Larger on mobile, can be smaller on desktop with mouse
 */
export function getTouchTargetSize(): number {
  if (Platform.OS === 'web') {
    return 36; // Smaller for mouse interaction
  }
  return 44; // iOS HIG minimum touch target
}

/**
 * Get optimal spacing for current platform
 */
export function getSpacing(): {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
} {
  const multiplier = Platform.OS === 'web' ? 1.2 : 1;
  
  return {
    xs: 4 * multiplier,
    sm: 8 * multiplier,
    md: 16 * multiplier,
    lg: 24 * multiplier,
    xl: 32 * multiplier,
  };
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscape(): boolean {
  const { width, height } = Dimensions.get('window');
  return width > height;
}

/**
 * Check if device is in portrait orientation
 */
export function isPortrait(): boolean {
  return !isLandscape();
}

/**
 * Get optimal font size for platform
 */
export function getBaseFontSize(): number {
  if (Platform.OS === 'web') {
    return 16; // Standard web font size
  }
  return 14; // Slightly smaller for mobile
}
