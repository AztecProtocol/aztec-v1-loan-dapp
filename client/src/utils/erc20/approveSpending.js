import Web3Service from '../../helpers/Web3Service';
import CurrencyService from '../../helpers/CurrencyService';

export default async function approveSpending({
  amount,
  spender,
  currencyId,
}) {
  const contractAddress = CurrencyService.getAddress(currencyId);

  await Web3Service.useContract('SettlementToken')
    .at(contractAddress)
    .method('approve')
    .send(
      spender,
      amount,
    );

  return amount;
}
