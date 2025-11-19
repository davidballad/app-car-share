import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  shadow = 'medium',
  borderRadius = 'medium',
}) => {
  const { colors, spacing, borderRadius: radius, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.background.card,
    };

    // Padding variations
    switch (padding) {
      case 'none':
        break;
      case 'small':
        baseStyle.padding = spacing[2];
        break;
      case 'large':
        baseStyle.padding = spacing[6];
        break;
      default: // medium
        baseStyle.padding = spacing[4];
    }

    // Border radius variations
    switch (borderRadius) {
      case 'none':
        baseStyle.borderRadius = radius.none;
        break;
      case 'small':
        baseStyle.borderRadius = radius.sm;
        break;
      case 'large':
        baseStyle.borderRadius = radius.lg;
        break;
      default: // medium
        baseStyle.borderRadius = radius.md;
    }

    // Shadow variations
    switch (shadow) {
      case 'none':
        break;
      case 'small':
        Object.assign(baseStyle, shadows.sm);
        break;
      case 'large':
        Object.assign(baseStyle, shadows.lg);
        break;
      default: // medium
        Object.assign(baseStyle, shadows.base);
    }

    return baseStyle;
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default Card;