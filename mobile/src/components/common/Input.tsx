import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    return {
      marginBottom: spacing[4],
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium as any,
      color: colors.text.primary,
      marginBottom: spacing[2],
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: error
        ? colors.status.error
        : isFocused
        ? colors.primary.blue
        : colors.border.light,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing[4],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: colors.text.primary,
      paddingVertical: spacing[3],
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontSize: typography.fontSize.sm,
      color: colors.status.error,
      marginTop: spacing[1],
    };
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={{ marginRight: spacing[2] }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{ marginLeft: spacing[2] }}
          >
            <Text style={{ color: colors.text.secondary }}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <View style={{ marginLeft: spacing[2] }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
};

export default Input;