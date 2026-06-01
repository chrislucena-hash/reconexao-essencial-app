import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reconexaoessencial',
  appName: 'Reconexao Essencial',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'app.reconexaoessencial.com.br',
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    // Safe-area spacing is applied in the React layout to keep fixed controls consistent.
    contentInset: 'never',
  },
};

export default config;
