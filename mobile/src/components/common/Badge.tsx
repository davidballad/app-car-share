import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'verified' | 'pending' | 'rejected';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
    };

    // Size variations
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = spacing[1];
        baseStyle.paddingHorizontal = spacing[2];
        break;
      case 'large':
        baseStyle.paddingVertical = spacing[3];
        baseStyle.paddingHorizontal = spacing[4];
        break;
      default: // medium
        baseStyle.paddingVertical = spacing[2];
        baseStyle.paddingHorizontal = spacing[3];
    }

    // Variant colors
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = colors.secondary.green;
        break;
      case 'success':
        baseStyle.backgroundColor = colors.status.success;
        break;
      case 'warning':
        baseStyle.backgroundColor = colors.status.warning;
        break;
      case 'error':
        baseStyle.backgroundColor = colors.status.error;
        break;
      case 'info':
        baseStyle.backgroundColor = colors.status.info;
        break;
      case 'verified':
        baseStyle.backgroundColor = colors.verification.verified;
        break;
      case 'pending':
        baseStyle.backgroundColor = colors.verification.pending;
        break;
      case 'rejected':
        baseStyle.backgroundColor = colors.verification.rejected;
        break;
      default: // primary
        baseStyle.backgroundColor = colors.primary.blue;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium as any,
      textAlign: 'center',
    };

    // Size variations
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = typography.fontSize.xs;
        break;
      case 'large':
        baseTextStyle.fontSize = typography.fontSize.base;
        break;
      default: // medium
        baseTextStyle.fontSize = typography.fontSize.sm;
    }

    // Special text color for warning
    if (variant === 'warning') {
      baseTextStyle.color = colors.text.primary;
    }

    return baseTextStyle;
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>
        {children}
      </Text>
    </View>
  );
};

export default Badge;