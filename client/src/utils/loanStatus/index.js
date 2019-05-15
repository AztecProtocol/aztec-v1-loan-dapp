import LOAN_STATUS from '../../config/loanStatus';
import {
  errorLog,
} from '../log';

export const loanStatus = (status) => {
  if (!LOAN_STATUS[status]) {
    errorLog(`Loan status not defined: ${status}`);
  }

  return LOAN_STATUS[status];
};

export default loanStatus;
