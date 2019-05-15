import loanStatus from './loanStatus';

export default function transformLoanStatusFromGraph({
  role,
  onChainStatus,
  viewRequests,
  viewRequest: ownRequest,
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
        const hasApprovedRequests = viewRequests
          && viewRequests.some(({
            sharedSecret,
          }) => !!sharedSecret);
        if (hasApprovedRequests) {
          status = loanStatus('awaiting_settlement');
        } else {
          status = loanStatus('pending');
        }
      } else if (ownRequest && ownRequest.sharedSecret) {
        status = loanStatus('awaiting_settlement');
      } else if (ownRequest) {
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
