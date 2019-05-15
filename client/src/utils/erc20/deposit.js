import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';
import CurrencyService from '../../helpers/CurrencyService';
import {
  errorLog,
} from '../../utils/log';

export default async function deposit({
  amount,
  currencyId,
}) {
  if (!amount) {
    return 0;
  }

  const contractAddress = CurrencyService.getAddress(currencyId);
  if (!contractAddress || +contractAddress === 0) {
    errorLog(`Cannot call deposit with empty contract address. currencyId = ${currencyId}`);
    return 0;
  }

  await Web3Service.useContract('SettlementToken')
    .at(contractAddress)
    .method('giveAddressDevBalance')
    .send(
      AuthService.address,
      amount,
    );

  return amount;
}
