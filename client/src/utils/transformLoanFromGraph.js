import AuthService from '../helpers/AuthService';
import isSameAddress from './isSameAddress';
import transformViewRequestFromGraph from './transformViewRequestFromGraph';
import transformLoanStatusFromGraph from './transformLoanStatusFromGraph';
import transformNoteFromGraph from './transformNoteFromGraph';

const retrieveLenderViewRequest = (viewRequests, currentAddress) =>
  viewRequests && viewRequests.find(request =>
    isSameAddress(request.lenderAddress, currentAddress));

export default function transformLoanFromGraph({
  id,
  notional,
  viewingKey,
  interestRate,
  interestPeriod,
  loanDuration,
  settlementCurrencyId,
  borrower,
  lender,
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

  const viewRequests = lenderAccess && lenderAccess.map(transformViewRequestFromGraph);
  const viewRequest = retrieveLenderViewRequest(viewRequests, currentAddress);

  const role = isSameAddress(currentAddress, borrower.address)
    ? 'borrower'
    : 'lender';

  const status = transformLoanStatusFromGraph({
    role,
    onChainStatus,
    viewRequests,
    viewRequest,
  });

  const balanceHistory = balance
    && balance.map(note => transformNoteFromGraph(note, currentAddress));

  return {
    id,
    address: id,
    notional,
    viewingKey,
    interestRate: +interestRate / 100,
    interestPeriod: +interestPeriod / 86400,
    loanDuration: +loanDuration / 86400,
    settlementCurrencyId,
    borrower,
    lender,
    viewRequests,
    viewRequest,
    status,
    createdAt: +createdAt * 1000,
    settledAt: +settledAt * 1000,
    repaidAt: +repaidAt * 1000,
    lastInterestWithdrawAt: +lastInterestWithdrawAt * 1000,
    maturity: +settledAt > 0
      ? (+settledAt + +loanDuration) * 1000
      : 0,
    balanceHistory,
    balance: balanceHistory
      && balanceHistory.find(({ status }) => status === 'CREATED'),
  };
};
