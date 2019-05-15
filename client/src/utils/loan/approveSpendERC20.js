import Web3Service from '../../helpers/Web3Service';
import {
  getBalance,
  approveSpending,
} from '../erc20';

export default async function approveSpendERC20({
  amount,
  currencyId,
}) {
  const balance = await getBalance({
    currencyId,
  });
  if (balance < amount) {
    return 0;
  }

  const aceContract = Web3Service.contract('ACE');
  const approvedAmount = await approveSpending({
    amount,
    spender: aceContract.address,
    currencyId,
  });

  return approvedAmount;
}
