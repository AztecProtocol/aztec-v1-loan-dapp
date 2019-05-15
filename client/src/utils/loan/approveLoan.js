import Web3Service from '../../helpers/Web3Service';
import {
  signNote,
} from '../note';

export default async function approveLoan({
  loanId,
  loanNote,
}) {
  const {
    noteHash,
  } = loanNote.exportNote();

  const loanSignature = await signNote({
    validatorAddress: loanId,
    noteHash,
    spender: loanId,
  });

  await Web3Service.useContract('LoanDapp')
    .method('approveLoanNotional')
    .send(
      noteHash,
      loanSignature,
      loanId,
    );

  return loanSignature;
}
