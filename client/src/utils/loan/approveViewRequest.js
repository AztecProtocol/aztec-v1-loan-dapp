import Web3Service from '../../helpers/Web3Service';
import {
  encryptMessage,
} from '../../utils/crypto';

export default async function approveViewRequest({
  loanId,
  notionalNoteHash,
  lenderAddress,
  lenderPublicKey,
  viewingKey,
}) {
  const sharedSecret = await encryptMessage(lenderPublicKey, viewingKey);
  await Web3Service.useContract('LoanDapp')
    .method('approveViewRequest')
    .send(
      loanId,
      lenderAddress,
      notionalNoteHash,
      sharedSecret,
    );

  return sharedSecret;
}
