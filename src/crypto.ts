export function isCryptoSupported(): boolean {
  return (
    TextEncoder !== undefined &&
    window.crypto !== undefined &&
    window.crypto.subtle !== undefined
  );
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const byteArray = new Uint8Array(digest);
  const chars = new Array(byteArray.length);
  byteArray.forEach((byte, index) => {
    chars[index] = byte.toString(16).padStart(2, '0');
  });
  return chars.join('');
}
