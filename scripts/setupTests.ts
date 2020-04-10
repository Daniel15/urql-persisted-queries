import { Crypto } from '@peculiar/webcrypto';

// Polyfills for functionality not available in Node.js
// TextEncoder
require('fast-text-encoding');

if (typeof window !== 'undefined') {
  // WebCrypto
  (window as any).crypto = new Crypto();
}
