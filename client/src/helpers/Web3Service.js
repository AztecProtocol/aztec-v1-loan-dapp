import Web3 from 'web3';
import SignerProvider from 'ethjs-provider-signer';
import {
  log,
  warnLog,
  errorLog,
} from '../utils/log';
import asyncDomEvent from '../utils/asyncDomEvent';
import AuthService from './AuthService';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.useHotWallet = true;
    this.contracts = {};
    this.abis = {};
    this.currentAddress = null;
    this.accountIntervalReq = null;
  }

  async init(useHotWallet = true) {
    const {
      readyState,
    } = document || {};
    if (readyState === 'interactive' || readyState === 'complete') {
      return this.getWeb3Instance(useHotWallet);
    }

    return asyncDomEvent(
      'DOMContentLoaded',
      async () => this.getWeb3Instance(useHotWallet),
    );
  }

  async getWeb3Instance(useHotWallet) {
    if (this.web3 && useHotWallet === this.useHotWallet) {
      return this.web3;
    }

    this.useHotWallet = useHotWallet;

    if (this.useHotWallet) {
      if (AuthService.address === null) {
        await AuthService.init();
      }
      return this.initWithSignerProvider();
    }

    return this.initWithHTTPProvider();
  }

  async initWithSignerProvider() {
    const provider = new SignerProvider('http://127.0.0.1:8545', {
      signTransaction: (rawTx, cb) => {
        AuthService.ks.signTransaction(rawTx, cb);
      },
      accounts: (cb) => {
        const address = this.getAddress();
        cb(null, address);
      },
    });

    const web3 = new Web3(provider);

    this.web3 = web3;

    return web3;
  }

  async initWithHTTPProvider() {
    let web3;
    if (window.ethereum) { // Modern dapp browsers...
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        web3 = new Web3(window.ethereum);
      } catch (error) {
        errorLog(error);
      }
    } else if (window.web3) { // Legacy dapp browsers...
      // Use Mist/MetaMask's provider.
      ({
        web3,
      } = window);
      log('Injected web3 detected.');
    } else { // Fallback to localhost; use dev console port by default...
      const provider = new Web3.providers.HttpProvider(
        'http://127.0.0.1:9545',
      );
      web3 = new Web3(provider);
      log('No web3 instance injected, using Local web3.');
    }

    this.web3 = web3;

    const accounts = await this.getAccounts();
    [this.currentAddress] = accounts;

    return web3;
  }

  async registerContract(
    config,
    {
      contractName = '',
    } = {},
  ) {
    if (!this.web3) return;

    const name = contractName || config.contractName;

    if (!config.abi) {
      errorLog(`Contract object "${name}" doesn't have an abi.`);
      return;
    }

    const networkId = await this.web3.eth.net.getId();
    const network = config.networks[networkId];
    const address = network && network.address;
    if (!address) {
      warnLog(`Contract object "${name}" doesn't have an address. Please set an address first.`);
    }

    this.abis[name] = config.abi;
    this.contracts[name] = new this.web3.eth.Contract(
      config.abi,
      address,
    );
  }

  async registerInterface(
    config,
    {
      name = '',
    } = {},
  ) {
    if (!this.web3) return;

    const interfaceName = name || config.contractName;
    this.abis[interfaceName] = config.abi;
  }

  onAddressChanged = (callback) => {
    if (this.useHotWallet) {
      AuthService.onAddressChanged(callback);
      return;
    }

    if (window.ethereum) {
      window.ethereum.on(
        'accountsChanged',
        (accounts) => {
          const account = accounts && accounts[0];
          this.currentAddress = account;
          callback(account);
        },
      );
      return;
    }

    const {
      currentProvider: {
        publicConfigStore,
      } = {},
    } = this.web3 || {};
    if (publicConfigStore) {
      publicConfigStore.on(
        'update',
        (accounts) => {
          const account = accounts && accounts[0];
          this.currentAddress = account;
          callback(account);
        },
      );
      return;
    }

    clearInterval(this.accountIntervalReq);
    this.accountIntervalReq = setInterval(async () => {
      const accounts = await this.getAccounts();
      if (accounts[0] !== this.currentAddress) {
        this.currentAddress = accounts[0];
        callback(this.currentAddress);
      }
    }, 200);
  }

  hasContract(contractName) {
    return !!this.contracts[contractName];
  }

  contract(contractName) {
    if (!this.hasContract(contractName)) {
      warnLog(`Contract object "${contractName}" hasn't been initiated.`);
    }

    return this.contracts[contractName];
  }

  async getAccounts() {
    if (!this.web3) {
      return [];
    }

    return this.web3.eth.getAccounts();
  }

  getAddress() {
    if (this.useHotWallet) {
      return AuthService.address.toString();
    }

    return this.currentAddress;
  }

  triggerMethod = async (type, method, ...args) => {
    const address = this.getAddress();
    const methodSetting = (args.length
      && typeof args[args.length - 1] === 'object'
      && args[args.length - 1])
      || null;
    const methodArgs = methodSetting
      ? args.slice(0, args.length - 1)
      : args;

    if (type === 'call') {
      return method(...methodArgs).call({
        from: address,
        ...methodSetting,
        gas: 6000000
      });
    }

    return new Promise((resolve, reject) => {
      method(...methodArgs)[type]({
        from: address,
        ...methodSetting,
        gas: 6000000
      })
        .on('transactionHash', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  };

  contractMethod(contract, methodName) {
    const method = contract.methods[methodName];
    return {
      call: async (...args) => this.triggerMethod('call', method, ...args),
      send: async (...args) => this.triggerMethod('send', method, ...args),
    };
  }

  useContract(contractName, contractAddress = null) {
    return {
      method: (methodName) => {
        let contract;
        if (!contractAddress) {
          contract = this.contracts[contractName];
        } else if (this.abis[contractName]) {
          contract = new this.web3.eth.Contract(
            this.abis[contractName],
            contractAddress,
          );
        }
        if (!contract) {
          errorLog(`'${contractName}' is not registered as a contract. Cannot call method '${methodName}' of undefined.`);
        }
        return this.contractMethod(contract, methodName);
      },
      at: (address) => {
        if (!this.abis[contractName]) {
          errorLog(`'${contractName}' is not registered as an interface.`);
        }
        return this.useContract(contractName, address);
      },
    };
  }
}

export default new Web3Service();
