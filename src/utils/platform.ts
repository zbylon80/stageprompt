// utils/platform.ts

import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isMobile = isAndroid || isIOS;

export const supportsKeyEvents = isAndroid || isWeb;
export const supportsBluetooth = isAndroid; // iOS may require additional configuration

// Determines if this is an editing environment or performance environment
export const isEditingEnvironment = isWeb;
export const isPerformanceEnvironment = isMobile;
