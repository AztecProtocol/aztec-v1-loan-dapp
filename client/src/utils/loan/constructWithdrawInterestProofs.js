import { DividendProof } from 'aztec.js';
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

  const balanceProof = new DividendProof(
    [notionalNote],
    [balanceNote, balanceRemainderNote],
    ratio1.denominator,
    ratio1.numerator,
    loanAddress,
  );

  const balanceProof = balanceProof.encodeABI();

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
  const withdrawnInterestProof = new DividendProof(
    [balanceNote],
    [withdrawInterestNote, interestRemainderNote],
    ratio2.denominator,
    ratio2.numerator,
    loanAddress,
  );

  const withdrawnInterestProof = withdrawnInterestProof.encodeABI();
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
