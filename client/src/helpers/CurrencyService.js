import settlementCurrencies from '../config/settlementCurrency';
import asyncForEach from '../utils/asyncForEach';
import {
  errorLog,
} from '../utils/log';
import Web3Service from './Web3Service';

class CurrencyService {
  constructor() {
    this.zkTokenAddresses = {};
    this.tokenAddresses = {};
  }

  initAddresses = async () => {
    await asyncForEach(Object.keys(settlementCurrencies), async (id) => {
      this.zkTokenAddresses[id] = await this.getZKTokenAddressFromContract(id);
      this.tokenAddresses[id] = await this.getTokenAddressFromZkTokenContract(id);
    });
  };

  async getZKTokenAddressFromContract(currencyId) {
    let address = '';
    try {
      address = await Web3Service.useContract('LoanDapp')
        .method('settlementCurrencies')
        .call(currencyId);

      if (+address === 0) {
        errorLog(`ZKERC20 address is empty. currencyId = ${currencyId}`);
      }
    } catch (error) {
      errorLog(error);
    }

    return address
  }

  async getTokenAddressFromZkTokenContract(currencyId) {
    let address = '';
    const zkTokenAddress = this.getZKAddress(currencyId);

    try {
      address = await Web3Service.useContract('ZKERC20')
        .at(zkTokenAddress)
        .method('erc20Address')
        .call();

      if (+address === 0) {
        errorLog(`ERC20 address is empty. currencyId = ${currencyId}`);
      }
    } catch (error) {
      errorLog(error);
    }

    return address
  }

  getAddress(currencyId) {
    return this.tokenAddresses[currencyId];
  }

  getZKAddress(currencyId) {
    return this.zkTokenAddresses[currencyId];
  }
}

export default new CurrencyService();
