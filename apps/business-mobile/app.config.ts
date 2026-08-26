import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Kleenest Business',
  slug: 'kleenest-business',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'kleenest-business',
  userInterfaceStyle: 'automatic',
  ios: { bundleIdentifier: 'com.kleenest.business' },
  android: { package: 'com.kleenest.business' },
  plugins: ['expo-router', 'expo-secure-store'],
  experiments: { typedRoutes: true },
};

export default config;
