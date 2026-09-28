import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.genshi.travel',
  appName: 'Genshi',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: process.env.CAPACITOR_SERVER_URL || 'https://genshitranslate.vercel.app',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f141c',
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0c0f1d',
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
