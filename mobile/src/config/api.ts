import { Platform } from 'react-native';

// Android emulator: 10.0.2.2 maps to host machine localhost
// iOS simulator: localhost works directly
// Physical device: replace with your machine's LAN IP (e.g. 192.168.1.x)
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9000/api/v1'
    : 'http://localhost:9000/api/v1';
