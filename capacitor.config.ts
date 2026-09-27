import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.genshi.travel',
  appName: 'Genshi',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // In development or when using live hosted backend, this can point to the server
    ...(process.env.CAPACITOR_SERVER_URL ? { url: process.env.CAPACITOR_SERVER_URL, cleartext: true } : {}),
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f141c',
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0f141c',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
