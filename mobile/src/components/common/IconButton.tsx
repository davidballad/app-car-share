import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  size = 'medium',
  variant = 'ghost',
  disabled = false,
  style,
}) => {
  const { colors, spacing, borderRadius } = useTheme();

  const getButtonSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 56;
      default: return 44; // medium
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const buttonSize = getButtonSize();
    
    const baseStyle: ViewStyle = {
      width: buttonSize,
      height: buttonSize,
      borderRadius: borderRadius.base,
      justifyContent: 'center',
      alignItems: 'center',
    };

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary.blue;
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.secondary.green;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border.medium;
        break;
      case 'ghost':
      default:
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    // Disabled state
    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View>{icon}</View>
    </TouchableOpacity>
  );
};

export default IconButton;