import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  backgroundColor?: string;
  textColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
  imageStyle,
  backgroundColor,
  textColor,
}) => {
  const { colors, typography } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      case 'xlarge': return 80;
      default: return 48; // medium
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return typography.fontSize.sm;
      case 'large': return typography.fontSize.xl;
      case 'xlarge': return typography.fontSize['2xl'];
      default: return typography.fontSize.lg; // medium
    }
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: backgroundColor || colors.primary.blue,
    },
    style,
  ];

  const textStyle = {
    fontSize,
    color: textColor || colors.text.inverse,
    fontWeight: typography.fontWeight.semibold as any,
  };

  const imgStyle = [
    styles.image,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    imageStyle,
  ];

  if (source) {
    return (
      <View style={containerStyle}>
        <Image source={source} style={imgStyle} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});

export default Avatar;