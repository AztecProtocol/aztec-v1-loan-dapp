import { JoinSplitProof } from 'aztec.js';
import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';
import CurrencyService from '../../helpers/CurrencyService';
import {
  createNote,
  valueOf,
  mintNote,
  signNote,
  approveNoteAccess,
} from '../note';
import constructBalanceProof from './constructBalanceProof';

export default async function repay({
  loanAddress,
  payableInterest,
  notionalSharedSecret,
  balanceSharedSecret,
  interestRate,
  interestPeriod,
  totalInterest,
  currencyId,
  settledAt,
  maturity,
  lender,
}) {
  const {
    notionalNote,
    balanceProof,
    balanceNote,
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
    lenderPublicKey: lender.publicKey,
  });

  const currencyContractAddress = CurrencyService.getZKAddress(currencyId);
  const notionalValue = valueOf(notionalNote);
  const balanceValue = valueOf(balanceNote);
  const interestValue = valueOf(withdrawnAmountNote);
  const repaymentValue = notionalValue
    - Math.max(0, balanceValue - interestValue);

  const borrowerRepaymnetNote = await mintNote({
    amount: repaymentValue,
    currencyContractAddress,
  });

  const {
    noteHash,
  } = borrowerRepaymnetNote.exportNote();

  const signature = await signNote({
    validatorAddress: currencyContractAddress,
    noteHash,
    spender: loanAddress,
  });

  await Web3Service.useContract('ZKERC20')
    .at(currencyContractAddress)
    .method('confidentialApprove')
    .send(
      noteHash,
      loanAddress,
      true,
      signature,
    );

  const currentAddress = AuthService.address;

  const lenderRepaymentNote = await createNote(notionalValue, lender.publicKey);

  const proof = new JoinSplitProof(
    [balanceNote, borrowerRepaymnetNote],
    [withdrawnAmountNote, lenderRepaymentNote],
    loanAddress,
    0,
    currentAddress,
  );
  
  const repayProof = proof.encodeABI();

  await Web3Service.useContract('Loan')
    .at(loanAddress)
    .method('repayLoan')
    .send(
      balanceProof,
      repayProof,
    );

  await approveNoteAccess({
    note: lenderRepaymentNote,
    shareWith: lender,
  });

  await approveNoteAccess({
    note: withdrawnAmountNote,
    shareWith: lender,
  });

  return repaymentValue;
}
