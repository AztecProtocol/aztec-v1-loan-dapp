import Web3Service from '../helpers/Web3Service';

export default async function approveTokenTransition(amount, settlementCurrencyId) {
  // TODO
  // use different contract according to settlementCurrencyId
  const loanContract = Web3Service.contract('LoanDapp');
  const account = await Web3Service.getAddress();

  if (process.env.NODE_ENV !== 'production') {
    await Web3Service.useContract('SettlementToken')
      .method('giveAddressDevBalance')
      .send(
        account,
        amount,
      );
  }

  await Web3Service.useContract('SettlementToken')
    .method('approve')
    .send(
      loanContract.address,
      amount,
    );
}
