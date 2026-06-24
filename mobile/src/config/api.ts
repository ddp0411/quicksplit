import { Platform } from 'react-native';

// Production / internal builds inject EXPO_PUBLIC_API_URL via the matching
// eas.json build profile (see mobile/eas.json). It is inlined at build time.
//
// Local dev fallback (no env set):
//   Android emulator: 10.0.2.2 maps to the host machine's localhost
//   iOS simulator:    localhost works directly
//   Physical device:  set EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g.
//                     EXPO_PUBLIC_API_URL=http://192.168.1.20:9000/api/v1
const ENV_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

const DEV_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9000/api/v1'
    : 'http://localhost:9000/api/v1';

export const API_BASE_URL = ENV_URL && ENV_URL.length > 0 ? ENV_URL : DEV_URL;
