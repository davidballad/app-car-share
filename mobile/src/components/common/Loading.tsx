import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  const loadingColor = color || colors.primary.blue;

  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator
        size={size}
        color={loadingColor}
        style={text ? { marginBottom: spacing[2] } : undefined}
      />
      {text && (
        <Text style={[
          styles.text,
          {
            color: colors.text.primary,
            fontSize: typography.fontSize.base,
          }
        ]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  text: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Loading;