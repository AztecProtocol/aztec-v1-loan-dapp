import aztec from 'aztec.js';
import AuthService from '../../helpers/AuthService';
import {
  restoreFromSharedSecret,
  createNote,
  valueOf,
} from '../note';
import calculateInterestDuration from './calculateInterestDuration';
import getFraction from '../getFraction';

const computeRemainderNoteValue = (value, za, zb) => {
  const expectedNoteValue = Math.floor(value * (za / zb));
  const remainder = value * za - expectedNoteValue * zb;

  return {
    remainder,
    expectedNoteValue,
  };
};

export default async function constructWithdrawInterestProofs({
  amount,
  loanAddress,
  notionalSharedSecret,
  balanceSharedSecret,
  interestRate,
  interestPeriod,
  totalInterest,
  settledAt,
  maturity,
  lenderPublicKey = '',
}) {
  const publicKey = lenderPublicKey || await AuthService.getPublicKey();

  const balanceNote = await restoreFromSharedSecret(balanceSharedSecret);
  balanceNote.owner = loanAddress;
  const balanceValue = valueOf(balanceNote);

  const notionalNote = await restoreFromSharedSecret(notionalSharedSecret);
  const notionalValue = valueOf(notionalNote);

  const ratio1 = getFraction(balanceValue / notionalValue);
  const currentBalance = computeRemainderNoteValue(
    notionalValue,
    ratio1.numerator,
    ratio1.denominator,
  );
  const balanceRemainderNote = await createNote(currentBalance.remainder);

  const {
    proofData: balanceProof,
  } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
    inputNotes: [notionalNote],
    outputNotes: [balanceNote, balanceRemainderNote],
    za: ratio1.denominator,
    zb: ratio1.numerator,
    senderAddress: loanAddress,
  });

  const duration = calculateInterestDuration({
    amount,
    totalInterest,
    settledAt,
    maturity,
    timeUnit: 's',
    roundingMethod: 'ceil',
  });
  const timeRatio = (duration * interestRate) / (interestPeriod * 86400 * 100);
  const ratio2 = getFraction(timeRatio / (ratio1.numerator / ratio1.denominator));
  const withdrawInterest = computeRemainderNoteValue(
    currentBalance.expectedNoteValue,
    ratio2.numerator,
    ratio2.denominator,
  );

  const interestRemainderNote = await createNote(withdrawInterest.remainder, publicKey);
  const withdrawInterestNote = await createNote(withdrawInterest.expectedNoteValue, publicKey);
  const {
    proofData: withdrawnInterestProof,
  } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
    inputNotes: [balanceNote],
    outputNotes: [withdrawInterestNote, interestRemainderNote],
    za: ratio2.denominator,
    zb: ratio2.numerator,
    senderAddress: loanAddress,
  });

  return {
    duration,
    notionalNote,
    balanceProof,
    balanceNote,
    balanceRemainderNote,
    withdrawnInterestProof,
    withdrawInterestNote,
    interestRemainderNote,
  };
}
