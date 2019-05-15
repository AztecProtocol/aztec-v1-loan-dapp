import {
  validatePrivateKeyFormat,
  privateKeyToPublicKey,
  privateKeyToAddress,
  encryptMessage,
  decryptMessage,
} from './crypto';

describe('account recovery', () => {
  const privateKey = '0xd8e70f46bcdd6c0437779bad4b927cb9160490620e7c69d9c26dbf7ddbf69701';
  const publicKey = '0x0468bac945f9aab61b51539fc295f0319b47cd89fb850dfb59a5676acad586d0c995ccb57006fac63484c4d3d89e60a6a9ce62348ddaf44df8a91e587843d2b32b';
  const address = '0x0563a36603911daaB46A3367d59253BaDF500bF9';

  it('provide a function to generate well-formatted private key', () => {
    expect(validatePrivateKeyFormat(privateKey)).toBe(privateKey);
    expect(validatePrivateKeyFormat(privateKey.slice(2))).toBe(privateKey);
    expect(validatePrivateKeyFormat(privateKey.slice(3))).toBe('');
    expect(validatePrivateKeyFormat(`${privateKey.slice(3)}h`)).toBe('');
    expect(validatePrivateKeyFormat(`0x${privateKey}`)).toBe('');
  });

  it('get public key by private key', () => {
    expect(privateKeyToPublicKey(privateKey)).toBe(publicKey);
    expect(privateKeyToPublicKey(privateKey.slice(2))).toBe(publicKey);
    expect(privateKeyToPublicKey(privateKey.slice(3))).toBe('');
    expect(privateKeyToPublicKey(`0x${privateKey}`)).toBe('');
  });

  it('get address from private key', () => {
    expect(privateKeyToAddress(privateKey)).toBe(address);
    expect(privateKeyToAddress(privateKey.slice(2))).toBe(address);
    expect(privateKeyToAddress(privateKey.slice(3))).toBe('');
    expect(privateKeyToAddress(`0x${privateKey}`)).toBe('');
  });
});

describe('encrypted message', () => {
  const privateKey = '0xd8e70f46bcdd6c0437779bad4b927cb9160490620e7c69d9c26dbf7ddbf69701';
  const publicKey = privateKeyToPublicKey(privateKey);
  const msg = '1234';

  it("encrypt message using user's public key", async () => {
    const encrypted = await encryptMessage(publicKey, msg);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(msg);
  });

  it("decrypt message using user's private key", async () => {
    const encrypted = await encryptMessage(publicKey, msg);
    const decrypted = await decryptMessage(privateKey, encrypted);
    expect(decrypted).toBe(msg);
  });
});
