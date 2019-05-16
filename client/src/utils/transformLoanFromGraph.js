import AuthService from '../helpers/AuthService';
import isSameAddress from './isSameAddress';
import transformLoanStatusFromGraph from './transformLoanStatusFromGraph';
import transformNoteFromGraph from './transformNoteFromGraph';

export default function transformLoanFromGraph({
  id,
  notional,
  interestRate,
  interestPeriod,
  loanDuration,
  settlementCurrencyId,
  borrower,
  lender,
  viewRequests,
  lenderAccess,
  startAt,
  balance,
  lastInterestWithdrawAt,
  status: onChainStatus,
  createdAt,
  settledAt,
  repaidAt,
}) {
  const currentAddress = AuthService.address;

  const role = isSameAddress(currentAddress, borrower.address)
    ? 'borrower'
    : 'lender';

  const notionalNote = transformNoteFromGraph(notional, currentAddress);

  const status = transformLoanStatusFromGraph({
    role,
    onChainStatus,
    viewRequests,
    lenderAccess,
    notionalNote,
    currentAddress,
  });

  const balanceHistory = balance
    && balance.map(note => transformNoteFromGraph(note, currentAddress));

  return {
    id,
    address: id,
    role,
    notionalNote,
    interestRate: +interestRate / 100,
    interestPeriod: +interestPeriod / 86400,
    loanDuration: +loanDuration / 86400,
    settlementCurrencyId,
    borrower,
    lender,
    viewRequests: viewRequests || [],
    lenderAccess: lenderAccess || [],
    status,
    createdAt: +createdAt * 1000,
    settledAt: +settledAt * 1000,
    repaidAt: +repaidAt * 1000,
    lastInterestWithdrawAt: +lastInterestWithdrawAt * 1000,
    maturity: +settledAt > 0
      ? (+settledAt + +loanDuration) * 1000
      : 0,
    balanceHistory,
    balanceNote: balanceHistory
      && balanceHistory.find(({ status }) => status === 'CREATED'),
  };
};
