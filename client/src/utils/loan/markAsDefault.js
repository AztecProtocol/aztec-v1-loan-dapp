import aztec from 'aztec.js';
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

  const {
    proofData,
  } = await aztec.proof.privateRange.encodePrivateRangeTransaction({
    originalNote: withdrawnAmountNote,
    comparisonNote: balanceNote,
    senderAddress: loanAddress,
  });

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
