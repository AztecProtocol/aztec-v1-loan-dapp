import aztec from 'aztec.js';
import AuthService from '../../helpers/AuthService';
import Web3Service from '../../helpers/Web3Service';
import {
  encryptMessage,
} from '../crypto';

export default async function createLoan({
  notional,
  interestRate,
  interestPeriod,
  loanDuration,
  settlementCurrencyId,
}) {
  const publicKey = await AuthService.getPublicKey();
  const loanNote = await aztec.note.create(publicKey, notional);
  const newTotalNote = await aztec.note.create(publicKey, notional);
  const oldTotalNote = await aztec.note.createZeroValueNote();
  const loanDappContract = Web3Service.contract('LoanDapp');
  const {
    noteHash,
  } = loanNote.exportNote();

  const {
    proofData,
  } = aztec.proof.mint.encodeMintTransaction({
    newTotalMinted: newTotalNote,
    oldTotalMinted: oldTotalNote,
    adjustedNotes: [loanNote],
    senderAddress: loanDappContract.address,
  });

  const viewingKey = loanNote.getView();
  const encryptedViewingKey = await encryptMessage(publicKey, viewingKey);

  await Web3Service.useContract('LoanDapp')
    .method('createLoan')
    .send(
      noteHash,
      encryptedViewingKey,
      publicKey,
      [
        interestRate * 100,
        interestPeriod * 86400,
        loanDuration * 86400,
        settlementCurrencyId,
      ],
      proofData,
    );

  return loanNote;
}
