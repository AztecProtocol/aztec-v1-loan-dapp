import {
  SettlementCurrencyAdded,
  LoanCreated,
  LoanApprovedForSettlement,
  ViewRequestCreated,
  ViewRequestApproved,
  NoteAccessApproved,
  SettlementSuccesfull,
} from "../types/LoanDapp/LoanDapp";
import {
  Loan as LoanTemplate,
  ZKERC20 as ZKERC20Template,
} from "../types/LoanDapp/templates";
import {
  Currency,
  Note,
  NoteAccess,
  User,
  Loan,
} from "../types/schema";

export function addSettlementCurrency(event: SettlementCurrencyAdded): void {
  let currencyAddress = event.params.settlementAddress;
  ZKERC20Template.create(currencyAddress);

  let currencyId = event.params.id.toHex();
  let currency = Currency.load(currencyId);
  if (currency == null) {
    currency = new Currency(currencyId);
  }
  currency.address = currencyAddress;
  currency.save();
}

export function createLoan(event: LoanCreated): void {
  let loanAddress = event.params.id;
  LoanTemplate.create(loanAddress);

  let loanVariables = event.params.loanVariables;
  let notionalNoteId = event.params.notional.toHex();
  let note = new Note(notionalNoteId);
  let settlementCurrencyId = loanVariables[3];
  let currency = Currency.load(settlementCurrencyId.toHex());
  note.ownerAddress = loanAddress;
  note.currencyAddress = currency.address;
  note.status = 'STATIC';
  note.save();

  let borrowerId = event.params.borrower.toHex();
  let user = User.load(borrowerId);
  if (user == null) {
    user = new User(borrowerId);
    user.id = borrowerId;
    user.publicKey = event.params.borrowerPublicKey;
    user.address = event.params.borrower;
    user.save();
  }

  let loanId = loanAddress.toHex();
  let loan = new Loan(loanId);
  loan.id = loanId;
  loan.notional = notionalNoteId;
  loan.borrower = borrowerId;
  loan.interestRate = loanVariables[0];
  loan.interestPeriod = loanVariables[1];
  loan.loanDuration = loanVariables[2];
  loan.settlementCurrencyId = settlementCurrencyId;
  loan.createdAt = event.params.createdAt;
  loan.status = '';
  loan.save();
}

export function borrowerApproveLoan(event: LoanApprovedForSettlement): void {
  let loanId = event.params.loanId.toHex();
  let loan = new Loan(loanId);
  if (loan != null) {
    loan.status = 'PENDING';
    loan.save();
  }
}

export function createViewRequest(event: ViewRequestCreated): void {
  let lenderId = event.params.lender.toHex();
  let user = User.load(lenderId);
  if (user == null) {
    user = new User(lenderId);
    user.address = event.params.lender;
    user.publicKey = event.params.lenderPublicKey;
    user.save();
  }

  let loanId = event.params.loanId.toHex();
  let loan = Loan.load(loanId);
  let prevViewRequests = loan.viewRequests;
  loan.viewRequests = prevViewRequests.concat([lenderId]);
  loan.save();
}

export function approveViewRequest(event: ViewRequestApproved): void {
  let loanId = event.params.loanId.toHex();
  let accessId = event.params.accessId.toHex();
  let userId = event.params.user.toHex();
  let loan = Loan.load(loanId);
  let noteId = loan.notional;

  let access = new NoteAccess(accessId);
  access.note = noteId;
  access.user = userId;
  access.sharedSecret = event.params.sharedSecret;
  access.save();

  let prevLenderAccess = loan.lenderAccess;
  loan.lenderAccess = prevLenderAccess.concat([accessId]);
  loan.save();

  let user = User.load(userId);
  let prevApprovedLoans = user.approvedLoans;
  user.approvedLoans = prevApprovedLoans.concat([loanId]);
  user.save();
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
