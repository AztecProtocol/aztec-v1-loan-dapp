import loanStatus from './loanStatus';
import isSameAddress from './isSameAddress';

export default function transformLoanStatusFromGraph({
  role,
  onChainStatus,
  viewRequests,
  lenderAccess,
  notionalNote,
  currentAddress,
}) {
  let status = '';

  switch (onChainStatus) {
    case 'DEFAULT':
      status = loanStatus('default');
      break;
    case 'REPAID':
      status = loanStatus('repaid');
      break;
    case 'SETTLED':
      status = loanStatus('settled');
      break;
    case 'PENDING': {
      if (role === 'borrower') {
        if (lenderAccess.length > 0) {
          status = loanStatus('awaiting_settlement');
        } else {
          status = loanStatus('pending');
        }
      } else if (notionalNote.sharedSecret) {
        status = loanStatus('awaiting_settlement');
      } else if (viewRequests.some(({ address }) => isSameAddress(address, currentAddress))) {
        status = loanStatus('awaiting_approval');
      } else {
        status = loanStatus('pending');
      }
      break;
    }
    default:
  }

  return status;
}
