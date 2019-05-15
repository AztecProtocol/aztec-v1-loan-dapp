import EthCrypto from 'eth-crypto';
import {
  errorLog,
} from './log';

const secp256k1 = require('@aztec/secp256k1');

export const validatePrivateKeyFormat = (privateKey) => {
  let formattedKey = privateKey;
  if (formattedKey.length === 64) {
    formattedKey = `0x${formattedKey}`;
  }
  if (!formattedKey.match(/^0x[a-f0-9]{64}$/i)) {
    errorLog('Private key format not valid', privateKey);
    return '';
  }
  return formattedKey;
};

export const privateKeyToPublicKey = (privateKey) => {
  const validPrivateKey = validatePrivateKeyFormat(privateKey);
  if (!validPrivateKey) {
    return '';
  }

  const {
    publicKey,
  } = secp256k1.accountFromPrivateKey(validPrivateKey);
  return publicKey;
};

export const privateKeyToAddress = (privateKey) => {
  const validPrivateKey = validatePrivateKeyFormat(privateKey);
  if (!validPrivateKey) {
    return '';
  }

  const {
    address,
  } = secp256k1.accountFromPrivateKey(validPrivateKey);
  return address;
};

export const encryptMessage = async (publicKey, msg) => {
  const encrypted = await EthCrypto.encryptWithPublicKey(
    publicKey.slice(4),
    msg,
  );
  return EthCrypto.cipher.stringify(encrypted);
};

export const decryptMessage = async (privateKey, encryptedMsg) =>
  EthCrypto.decryptWithPrivateKey(
    privateKey,
    EthCrypto.cipher.stringify(encryptedMsg),
  );
