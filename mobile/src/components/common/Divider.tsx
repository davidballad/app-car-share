import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
  margin?: number;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color,
  style,
  margin,
}) => {
  const { colors, spacing } = useTheme();

  const dividerColor = color || colors.border.light;
  const dividerMargin = margin !== undefined ? margin : spacing[2];

  const dividerStyle: ViewStyle = {
    backgroundColor: dividerColor,
    ...(orientation === 'horizontal'
      ? {
          height: thickness,
          marginVertical: dividerMargin,
        }
      : {
          width: thickness,
          marginHorizontal: dividerMargin,
        }),
  };

  return <View style={[dividerStyle, style]} />;
};

export default Divider;