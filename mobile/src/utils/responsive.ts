import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 6/7/8 dimensions
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

/**
 * Scale size based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size based on screen size and pixel density
 */
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get responsive dimensions
 */
export const getResponsiveDimensions = () => ({
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < 375,
  isMediumScreen: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeScreen: SCREEN_WIDTH >= 414,
  isShortScreen: SCREEN_HEIGHT < 667,
  isTallScreen: SCREEN_HEIGHT >= 812,
});

/**
 * Get responsive padding/margin based on screen size
 */
export const getResponsiveSpacing = (baseSpacing: number) => {
  const { isSmallScreen, isLargeScreen } = getResponsiveDimensions();
  
  if (isSmallScreen) {
    return baseSpacing * 0.8;
  } else if (isLargeScreen) {
    return baseSpacing * 1.2;
  }
  
  return baseSpacing;
};

/**
 * Get responsive border radius
 */
export const getResponsiveBorderRadius = (baseBorderRadius: number) => {
  return scaleWidth(baseBorderRadius);
};

export default {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  getResponsiveDimensions,
  getResponsiveSpacing,
  getResponsiveBorderRadius,
};