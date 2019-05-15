import ethWallet from 'eth-lightwallet/dist/lightwallet.min.js';
import {
  validatePrivateKeyFormat,
  privateKeyToPublicKey,
} from '../utils/crypto';
import {
  errorLog,
} from '../utils/log';

// The development enviroment creates the following ethereum accounts and funds them with ETH
// ----------------------------------------------------
// ACCOUNT NAME: BORROWER
// ADDRESS: 0x59359d0707023e96a165d8350f973376510ace07
// PASSWORD: zkborrower
// MNEMONIC:
// ---------------------------------------
// ACCOUNT NAME: LENDER
// ADDRESS: 0x59359d0707023e96a165d8350f973376510ace07
// PASSWORD: zklender
// MNEMONIC:

const defaultSessionTimeout = process.env.NODE_ENV === 'development'
  ? 86400000
  : 0;

class AuthService {
  constructor({
    maxPasswordRetry = 3,
    sessionTimeout = defaultSessionTimeout,
  } = {}) {
    this.maxPasswordRetry = maxPasswordRetry;
    this.sessionTimeout = sessionTimeout;
    this.isLoggedIn = false;
    this.ks = null;
    this.address = null;
    this.password = null;
    this.addressChangedCallbacks = [];
  }

  async init() {
    ethWallet.keystore.prototype.passwordProvider = (cb) => {
      cb && cb(null, this.password);
      return this.password;
    };

    this.isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!this.isLoggedIn) return;

    const ks = localStorage.getItem('ks');
    this.ks = ks && ethWallet.keystore.deserialize(ks);

    let password = localStorage.getItem('password');
    if (password !== null) {
      const timeout = localStorage.getItem('passwordExpiration');
      if (Date.now() > timeout) {
        localStorage.removeItem('password');
        password = null;
      }
    }
    if (password === null) {
      password = await this.getPasswordFromUser();
      if (password === null) {
        this.logout();
        return;
      }
      if (this.sessionTimeout > 0) {
        localStorage.setItem(
          'passwordExpiration',
          Date.now() + this.sessionTimeout,
        );
        localStorage.setItem(
          'password',
          password,
        );
      }
    }

    this.password = password;
    this.address = await this.getAddress();
  }

  async getPasswordFromUser(retry = this.maxPasswordRetry) {
    const password = prompt(
      retry === this.maxPasswordRetry
        ? 'Enter password to continue'
        : 'Wrong password. Please try again:',
      '',
    );
    if (password === null) {
      return null;
    }

    try {
      this.password = password;
      await this.getAddress();
    } catch (error) {
      if (retry - 1) {
        return this.getPasswordFromUser(retry - 1);
      }
      return null;
    }

    return password;
  }

  async loginWithPassword(password) {
    if (!password) {
      errorLog('Password is empty');
      return;
    }
    if (!this.ks) {
      errorLog('keystore is not defined');
      return;
    }

    this.password = password;
    this.isLoggedIn = true;
    this.address = await this.getAddress();
    localStorage.setItem(
      'isLoggedIn',
      true,
    );
    localStorage.setItem(
      'ks',
      this.ks.serialize(),
    );
  }

  logout = () => {
    this.isLoggedIn = false;
    this.ks = null;
    const prevAddress = this.address;
    this.address = null;
    this.password = null;
    localStorage.clear();

    if (prevAddress !== null) {
      this.handleChangeAddress();
    }
  };

  getKeyFromPassword = () => new Promise((resolve, reject) => {
    this.ks.keyFromPassword(this.password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(pwDerivedKey);
    });
  });

  async getAddress() {
    const pwDerivedKey = await this.getKeyFromPassword();
    this.ks.generateNewAddress(pwDerivedKey, 1);
    return this.ks.getAddresses()[0];
  }

  async getPrivateKey() {
    const derivedKey = await this.getKeyFromPassword();
    const privateKey = this.ks.exportPrivateKey(this.address, derivedKey);
    return validatePrivateKeyFormat(privateKey);
  }

  async getPublicKey() {
    const privateKey = await this.getPrivateKey();
    return privateKeyToPublicKey(privateKey);
  }

  restoreAccount = data => new Promise((resolve, reject) => {
    const {
      password,
      seedPhrase,
    } = data;

    ethWallet.keystore.createVault({
      password,
      seedPhrase,
      hdPathString: "m/44'/60'/0'/0'",
    }, async (err, ks) => {
      if (err) {
        reject(err);
        return;
      }

      this.ks = ks;
      await this.loginWithPassword(password);

      resolve({
        password,
        seedPhrase,
      });
    });
  })

  createAccount = data => new Promise((resolve, reject) => {
    const {
      accountName,
      password,
    } = data;
    const seedPhrase = ethWallet.keystore.generateRandomSeed(accountName);

    ethWallet.keystore.createVault({
      password,
      seedPhrase,
      hdPathString: "m/44'/60'/0'/0'",
    }, async (err, ks) => {
      if (err) {
        reject(err);
        return;
      }

      this.ks = ks;
      await this.loginWithPassword(password);

      resolve({
        accountName,
        password,
        seedPhrase,
      });
    });
  });

  onAddressChanged(callback) {
    this.addressChangedCallbacks.push(callback);
  }

  handleChangeAddress(address) {
    this.addressChangedCallbacks.forEach(callback => callback(address));
  }
}

export default new AuthService();
