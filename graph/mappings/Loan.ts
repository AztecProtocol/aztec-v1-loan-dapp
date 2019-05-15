import {
  LoanPayment,
  LoanDefault,
  LoanRepaid,
} from '../types/LoanDapp/templates/Loan/Loan';
import {
  Loan,
} from '../types/schema';

export function receivePayment(event: LoanPayment): void {
  let loanAddress = event.address;
  let loanId = loanAddress.toHex();
  let loan = Loan.load(loanId);
  loan.lastInterestWithdrawAt = event.params.lastInterestPaymentDate;
  loan.save();
}

export function markLoanAsDefault(event: LoanDefault): void {
  let loanAddress = event.address;
  let loanId = loanAddress.toHex();
  let loan = Loan.load(loanId);
  loan.status = 'DEFAULT';
  loan.save();
}

export function markLoanAsRepaid(event: LoanRepaid): void {
  let loanAddress = event.address;
  let loanId = loanAddress.toHex();
  let loan = Loan.load(loanId);
  loan.status = 'REPAID';
  loan.repaidAt = event.block.timestamp;
  loan.save();
}
