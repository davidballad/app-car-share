module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/services': './src/services',
            '@/store': './src/store',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/constants': './src/constants',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};