import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';
import CurrencyService from '../../helpers/CurrencyService';

export default async function getBalance({
  currencyId,
}) {
  const address = AuthService.address;
  const contractAddress = CurrencyService.getAddress(currencyId);

  const balance = await Web3Service.useContract('SettlementToken')
    .at(contractAddress)
    .method('balanceOf')
    .call(
      address,
    );

  return (balance && balance.toNumber()) || 0;
}
