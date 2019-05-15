import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';

export default async function submitViewRequest({
  loanId,
}) {
  const lenderPublicKey = await AuthService.getPublicKey();
  await Web3Service.useContract('LoanDapp')
    .method('submitViewRequest')
    .send(
      loanId,
      lenderPublicKey,
    );

  return lenderPublicKey;
}
