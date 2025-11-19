import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size variations
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = spacing[2];
        baseStyle.paddingHorizontal = spacing[4];
        break;
      case 'large':
        baseStyle.paddingVertical = spacing[4];
        baseStyle.paddingHorizontal = spacing[8];
        break;
      default: // medium
        baseStyle.paddingVertical = spacing[3];
        baseStyle.paddingHorizontal = spacing[6];
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = colors.secondary.green;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary.blue;
        break;
      case 'whatsapp':
        baseStyle.backgroundColor = colors.whatsapp;
        break;
      case 'danger':
        baseStyle.backgroundColor = colors.status.error;
        break;
      default: // primary
        baseStyle.backgroundColor = colors.primary.blue;
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: typography.fontWeight.semibold as any,
      textAlign: 'center',
    };

    // Size variations
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = typography.fontSize.sm;
        break;
      case 'large':
        baseTextStyle.fontSize = typography.fontSize.lg;
        break;
      default: // medium
        baseTextStyle.fontSize = typography.fontSize.base;
    }

    // Text color based on variant
    switch (variant) {
      case 'outline':
        baseTextStyle.color = colors.primary.blue;
        break;
      default:
        baseTextStyle.color = colors.text.inverse;
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary.blue : colors.text.inverse}
          style={{ marginRight: spacing[2] }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;