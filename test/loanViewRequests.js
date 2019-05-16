/* global contract assert */
import dotenv from 'dotenv';
import web3Events from './helpers/web3Events';
import {
  assertRevert,
} from './helpers/exceptions';
import LoanService from './helpers/LoanService';

const secp256k1 = require('@aztec/secp256k1');

dotenv.config();

contract('LoanDapp', async () => {
  let loan;

  const stranger = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_3);

  beforeEach(async () => {
    loan = new LoanService();
    await loan.advanceToStep('createLoan');
  });

  it('should trigger an event after submitting a view request', async () => {
    const transaction = await loan.submitViewRequest();

    const triggeredEvents = web3Events(transaction);
    assert.equal(triggeredEvents.count(), 1);

    const {
      lender,
      loanData,
    } = loan;

    triggeredEvents.event('ViewRequestCreated').hasBeenCalledWith({
      loanId: loanData.loanId,
      lender: lender.address,
      lenderPublicKey: lender.publicKey,
    });
  });

  it('should allow more than one user to submit a view request', async () => {
    const transaction0 = await loan.submitViewRequest();

    const {
      lender,
      loanData,
    } = loan;

    const events0 = web3Events(transaction0);
    events0.event('ViewRequestCreated').hasBeenCalledWith({
      loanId: loanData.loanId,
      lender: lender.address,
      lenderPublicKey: lender.publicKey,
    });

    const transaction1 = await loan.submitViewRequest({
      user: stranger,
    });

    const events1 = web3Events(transaction1);
    events1.event('ViewRequestCreated').hasBeenCalledWith({
      loanId: loanData.loanId,
      lender: stranger.address,
      lenderPublicKey: stranger.publicKey,
    });
  });

  it('should trigger an event after approving a view request', async () => {
    await loan.advanceToStep('submitViewRequest');

    const transaction = await loan.approveViewRequest();

    const triggeredEvents = web3Events(transaction);
    assert.equal(triggeredEvents.count(), 1);

    const {
      lender,
      loanData,
    } = loan;

    const approvedEvent = triggeredEvents.event('ViewRequestApproved');
    approvedEvent.hasBeenCalledWith({
      loanId: loanData.loanId,
      user: lender.address,
    });

    const accessId = approvedEvent.param('accessId');
    assert.equal(!!accessId.toString(), true);
    assert.equal(!!approvedEvent.param('sharedSecret'), true);
  });

  it('should not allow anyone other than borrower to approve a view request', async () => {
    await loan.advanceToStep('submitViewRequest');

    const {
      borrower,
    } = loan;
    assert.equal(stranger.address !== borrower.address, true);

    await assertRevert(loan.approveViewRequest({
      user: stranger,
    }));
  });
});
