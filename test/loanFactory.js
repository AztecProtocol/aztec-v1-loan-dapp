/* global contract assert */
import dotenv from 'dotenv';
import web3Events from './helpers/web3Events';
import blockTime from './helpers/blockTime';
import {
  assertRevert,
  assertInvalidOpcode,
} from './helpers/exceptions';
import LoanService from './helpers/LoanService';

const secp256k1 = require('@aztec/secp256k1');

dotenv.config();

contract('LoanDapp', async () => {
  let loanDappContract;
  let loan;

  const stranger = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_3);

  beforeEach(async () => {
    loan = new LoanService();
    await loan.advanceToStep('newLoanDappContract');
    ({ loanDappContract } = loan);
  });

  it('should allow owner to add settlement currency', async () => {
    const {
      settlementCurrencyId,
    } = loan;
    const prevAddress = await loanDappContract.settlementCurrencies(settlementCurrencyId);
    assert.equal(+prevAddress, 0);

    const newTokenContract = await loan.newSettlementTokenContract();
    await loan.addSettlementCurrency({
      settlementCurrencyId,
      settlementTokenContract: newTokenContract,
    });

    const currencyAddress = await loanDappContract.settlementCurrencies(settlementCurrencyId);
    assert.equal(currencyAddress, newTokenContract.address);
  });

  it('should prevent non-owner to add settlement currency', async () => {
    const {
      settlementCurrencyId,
      contractOwner,
    } = loan;

    const newTokenContract = await loan.newSettlementTokenContract();
    assert.equal(stranger.address !== contractOwner.address, true);

    await assertRevert(loan.addSettlementCurrency({
      settlementCurrencyId,
      settlementTokenContract: newTokenContract,
      user: stranger,
    }));

    const currencyAddress = await loanDappContract.settlementCurrencies(settlementCurrencyId);
    assert.equal(+currencyAddress, 0);
  });

  it('should fire an event after adding a settlement currency', async () => {
    const {
      settlementCurrencyId,
    } = loan;

    const newTokenContract = await loan.newSettlementTokenContract();

    const transaction = await loan.addSettlementCurrency({
      settlementCurrencyId,
      settlementTokenContract: newTokenContract,
    });

    const triggeredEvents = web3Events(transaction);
    assert.equal(triggeredEvents.count(), 1);

    triggeredEvents.event('SettlementCurrencyAdded').hasBeenCalledExactlyWith({
      id: settlementCurrencyId,
      settlementAddress: newTokenContract.address,
    });
  });

  it('should be able to create a loan', async () => {
    await loan.advanceToStep('addSettlementCurrency');

    await assertInvalidOpcode(loanDappContract.loans(0));

    await loan.createLoan();

    const firstLoanAddress = await loanDappContract.loans(0);
    assert.equal(firstLoanAddress > 0, true);
  });

  it('should trigger an event after creating a loan', async () => {
    await loan.advanceToStep('addSettlementCurrency');

    await assertInvalidOpcode(loanDappContract.loans(0));

    const transaction = await loan.createLoan();
    const {
      loanData,
      settlementCurrencyId,
      borrower,
    } = loan;

    const triggeredEvents = web3Events(transaction);
    assert.equal(triggeredEvents.count(), 2);

    const firstLoanAddress = await loanDappContract.loans(0);
    const timestamp = await blockTime.fromTransaction(transaction);

    const createdEvent = triggeredEvents.event('LoanCreated');
    createdEvent.hasBeenCalledWith({
      id: firstLoanAddress,
      notional: loanData.notionalNoteHash,
      loanVariables: [
        loanData.interestRate,
        loanData.interestPeriod,
        loanData.loanDuration,
        settlementCurrencyId,
      ],
      borrower: borrower.address,
      createdAt: timestamp,
    });

    const approvedEvent = triggeredEvents.event('NoteAccessApproved');
    approvedEvent.hasBeenCalledWith({
      note: loanData.notionalNoteHash,
      user: borrower.address,
      sharedSecret: loanData.viewingKey,
    });
    const noteAccessId = approvedEvent.param('accessId');
    assert.equal(!!noteAccessId.toString(), true);
  });
});
