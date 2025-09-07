import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.32f9d8c33cf9496b90a047cfb73c1a9a',
  appName: 'Heart Zone Trainer',
  webDir: 'dist',
  server: {
    url: 'https://32f9d8c3-3cf9-496b-90a0-47cfb73c1a9a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    Haptics: {
      enabled: true
    }
  }
};

export default config;