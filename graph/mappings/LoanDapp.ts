import {
  SettlementCurrencyAdded,
  LoanCreated,
  LoanApprovedForSettlement,
  ViewRequestCreated,
  ViewRequestAccepted,
  SettlementSuccesfull,
} from "../types/LoanDapp/LoanDapp";
import {
  Loan as LoanTemplate,
  ZKERC20 as ZKERC20Template,
} from "../types/LoanDapp/templates";
import {
  NoteAccessApproved,
} from "../types/LoanPayment/LoanPayment";
import {
  Note,
  NoteAccess,
  User,
  Loan,
  LenderAccess,
} from "../types/schema";

export function addSettlementCurrency(event: SettlementCurrencyAdded): void {
  let settlementAddress = event.params.settlementAddress;
  ZKERC20Template.create(settlementAddress);
}

export function createLoan(event: LoanCreated): void {
  let loanAddress = event.params.id;
  LoanTemplate.create(loanAddress);

  let loanId = loanAddress.toHex();
  let borrowerId = event.params.borrower.toHex();
  let loan = new Loan(loanId);
  let loanVariables = event.params.loanVariables;
  loan.id = loanId;
  loan.notional = event.params.notional;
  loan.viewingKey = event.params.viewingKey;
  loan.borrower = borrowerId;
  loan.interestRate = loanVariables[0];
  loan.interestPeriod = loanVariables[1];
  loan.loanDuration = loanVariables[2];
  loan.settlementCurrencyId = loanVariables[3];
  loan.createdAt = event.params.createdAt;
  loan.status = '';
  loan.save();

  let user = User.load(borrowerId);
  if (user == null) {
    user = new User(borrowerId);
    user.id = borrowerId;
    user.publicKey = event.params.borrowerPublicKey;
    user.address = event.params.borrower;
  }
  // user.loans.push(loanId);
  user.save();
}

export function borrowerApproveLoan(event: LoanApprovedForSettlement): void {
  let loanId = event.params.loanId.toHex();
  let loan = new Loan(loanId);
  if (loan != null) {
    loan.status = 'PENDING';
    loan.save();
  }
}

export function createFillRequest(event: ViewRequestCreated): void {
  let loanId = event.params.loanId.toHex();
  let lenderId = event.params.lender.toHex();
  let user = User.load(lenderId);
  if (user == null) {
    user = new User(lenderId);
    user.address = event.params.lender;
    user.publicKey = event.params.lenderPublicKey;
    user.save();
  }

  let lenderAccess = new LenderAccess(event.params.id.toHex());
  lenderAccess.lender = lenderId;
  lenderAccess.loan = loanId;
  lenderAccess.lenderPublicKey = event.params.lenderPublicKey;
  lenderAccess.save();
}

export function acceptFillRequest(event: ViewRequestAccepted): void {
  let lenderAccessId = event.params.id.toHex();
  let lenderAccess = LenderAccess.load(lenderAccessId);
  lenderAccess.sharedSecret = event.params.sharedSecret;
  lenderAccess.save();

  let lenderId = event.params.lender.toHex();
  let loanId = event.params.loanId.toHex();
  let lender = User.load(lenderId);
  let prevApprovedLoans = lender.approvedLoans;
  lender.approvedLoans = prevApprovedLoans.concat([loanId]);
  lender.save();
}

export function settleLoan(event: SettlementSuccesfull): void {
  let lenderAddress = event.params.from;
  let lenderId = lenderAddress.toHex();
  let lender = User.load(lenderId);
  if (lender == null) {
    lender = new User(lenderId);
    lender.address = lenderAddress;
  }
  lender.save();

  let loanId = event.params.loanId.toHex();
  let loan = Loan.load(loanId);
  loan.lender = lenderId;
  loan.status = 'SETTLED';
  loan.settledAt = event.block.timestamp;
  loan.save();
}

export function approveNoteAccess(event: NoteAccessApproved): void {
  let noteId = event.params.note.toHex();
  let userId = event.params.user.toHex();
  let accessId = event.params.accessId.toHex();
  let access = new NoteAccess(accessId);
  access.note = noteId;
  access.user = event.params.user.toHex();
  access.sharedSecret = event.params.sharedSecret;
  access.save();

  let note = Note.load(noteId);
  if (note != null && note.ownerAddress.toHex() == userId) {
    let user = User.load(userId);
    let prevBalanceAccess = user.balanceAccess;
    user.balanceAccess = prevBalanceAccess.concat([accessId]);
    user.save();
  }
}
