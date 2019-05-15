import aztec from 'aztec.js';
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

export default async function constructBalanceProof({
  amount,
  duration = null,
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
  const balanceNote = await restoreFromSharedSecret(balanceSharedSecret);
  balanceNote.owner = loanAddress;

  const notionalNote = await restoreFromSharedSecret(notionalSharedSecret);
  const notionalValue = valueOf(notionalNote);

  const amountDuration = duration
    || calculateInterestDuration({
      amount,
      totalInterest,
      settledAt,
      maturity,
      timeUnit: 's',
      roundingMethod: 'ceil',
    });
  const ratio1 = getFraction((interestPeriod * 86400 * 100) / (amountDuration * interestRate));
  const {
    expectedNoteValue,
    remainder,
  } = computeRemainderNoteValue(notionalValue, ratio1.denominator, ratio1.numerator);
  const withdrawnAmountNote = await createNote(expectedNoteValue, lenderPublicKey);
  const balanceRemainderNote = await createNote(remainder, lenderPublicKey);

  const {
    proofData: balanceProof,
  } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
    inputNotes: [notionalNote],
    outputNotes: [withdrawnAmountNote, balanceRemainderNote],
    za: ratio1.numerator,
    zb: ratio1.denominator,
    senderAddress: loanAddress,
  });

  return {
    duration: amountDuration,
    notionalNote,
    balanceProof,
    balanceNote,
    balanceRemainderNote,
    withdrawnAmountNote,
  };
}
