import { sha256, isCryptoSupported } from '../src/crypto';

describe('sha256', () => {
  test('supported', () => {
    expect(isCryptoSupported()).toBe(true);
  });

  test('computes the hash', async () => {
    const hash = await sha256('Hello world!');
    expect(hash).toEqual(
      'c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7df31ad9e51a',
    );
  });
});
