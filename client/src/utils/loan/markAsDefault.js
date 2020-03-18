import { PrivateRangeProof, note } from 'aztec.js';
import { generateAccount } from '@aztec/secp256k1';
import Web3Service from '../../helpers/Web3Service';
import constructBalanceProof from './constructBalanceProof';

export default async function markAsDefault({
  payableInterest,
  loanAddress,
  notionalSharedSecret,
  balanceSharedSecret,
  interestRate,
  interestPeriod,
  totalInterest,
  settledAt,
  maturity,
  borrower,
}) {
  const {
    balanceProof,
    balanceNote,
    duration,
    withdrawnAmountNote,
  } = await constructBalanceProof({
    amount: payableInterest,
    loanAddress,
    notionalSharedSecret,
    balanceSharedSecret,
    interestRate,
    interestPeriod,
    totalInterest,
    settledAt,
    maturity,
  });

  const utilityValue = (withdrawnAmountNote.k).sub(balanceNote.k);
  const utilityNote = await note.create(generateAccount().publicKey, utilityValue);

  const proof = await new PrivateRangeProof(
    withdrawnAmountNote,
    balanceNote,
    utilityNote,
    loanAddress,
  );

  const proofData = proof.encodeABI();

  await Web3Service.useContract('Loan')
    .at(loanAddress)
    .method('markLoanAsDefault')
    .send(
      balanceProof,
      proofData,
      duration,
    );

  return true;
}
