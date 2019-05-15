import aztec from 'aztec.js';
import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';
import {
  approveNoteAccess,
  valueOf,
  createNote,
} from '../note';
import constructBalanceProof from './constructBalanceProof';

export default async function withdrawInterest({
  loanAddress,
  amount,
  duration = null,
  notionalSharedSecret,
  balanceSharedSecret,
  interestRate,
  interestPeriod,
  totalInterest,
  settledAt,
  maturity,
  borrower,
}) {
  if (!amount
    || !notionalSharedSecret
    || !balanceSharedSecret
  ) {
    return 0;
  }

  const {
    duration: validatedDuration,
    balanceProof,
    balanceNote,
    withdrawnAmountNote,
  } = await constructBalanceProof({
    amount,
    duration,
    loanAddress,
    notionalSharedSecret,
    balanceSharedSecret,
    interestRate,
    interestPeriod,
    totalInterest,
    settledAt,
    maturity,
  });

  const expectedWithdrawnAmount = valueOf(withdrawnAmountNote);
  if (expectedWithdrawnAmount !== amount) {
    return expectedWithdrawnAmount;
  }

  const balanceValue = valueOf(balanceNote);
  const changeValue = Math.max(
    0,
    balanceValue - amount,
  );
  const publicKey = await AuthService.getPublicKey();
  const newBalanceNote = await createNote(changeValue, publicKey, loanAddress);

  const {
    proofData: withdrawnAmountProof,
  } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
    inputNotes: [balanceNote],
    outputNotes: [withdrawnAmountNote, newBalanceNote],
    inputNoteOwners: [],
    senderAddress: loanAddress,
    publicOwner: borrower.address,
    kPublic: 0,
  });

  await Web3Service.useContract('Loan')
    .at(loanAddress)
    .method('withdrawInterest')
    .send(
      balanceProof,
      withdrawnAmountProof,
      validatedDuration,
    );

  await approveNoteAccess({
    note: newBalanceNote,
    shareWith: borrower,
  });

  await approveNoteAccess({
    note: withdrawnAmountNote,
  });

  return expectedWithdrawnAmount;
}
