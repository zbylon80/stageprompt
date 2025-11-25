import { Platform, ViewStyle } from 'react-native';

/**
 * Creates cross-platform shadow styles
 * On web, uses boxShadow. On native, uses shadow* props.
 */
export function createShadow(
  elevation: number,
  color: string = '#000',
  opacity: number = 0.3
): ViewStyle {
  if (Platform.OS === 'web') {
    // Web: use boxShadow only
    const offsetY = Math.round(elevation * 0.5);
    const blurRadius = Math.round(elevation * 1.5);
    return {
      boxShadow: `0px ${offsetY}px ${blurRadius}px rgba(0, 0, 0, ${opacity})`,
    } as any;
  }

  // Native: use shadow props and elevation
  const offsetY = Math.round(elevation * 0.5);
  const shadowRadius = Math.round(elevation * 1.5);
  
  return {
    elevation,
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius,
  };
}

// Predefined shadow levels
export const shadows = {
  small: createShadow(2, '#000', 0.1),
  medium: createShadow(4, '#000', 0.2),
  large: createShadow(8, '#000', 0.3),
};
