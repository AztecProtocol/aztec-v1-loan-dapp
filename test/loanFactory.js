/* global artifacts contract assert */
import dotenv from 'dotenv';
import web3Events from './helpers/web3Events';
import blockTime from './helpers/blockTime';
import {
  assertRevert,
  assertInvalidOpcode,
} from './helpers/exceptions';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const LoanDapp = artifacts.require('./LoanDapp.sol');
const SettlementToken = artifacts.require('./SettlementToken.sol');

dotenv.config();

contract('LoanDapp', async () => {
  let loanDappContract;
  let settlementTokenContract;
  const settlementCurrencyId = 1;

  const defaultLoanData = {
    notionalValue: 10000,
    viewingKey: '0x0368bac945f9aab61b51539fc295f0319b47cd89fb850dfb59a5676acad586d0c9',
    interestRate: 1000, // 10%
    interestPeriod: 1 * 86400,
    loanDuration: 10 * 86400,
  };

  const contractOwner = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_0);
  const borrower = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_1);
  const stranger = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_2);

  beforeEach(async () => {
    const ace = await ACE.deployed();
    loanDappContract = await LoanDapp.new(ace.address);
    settlementTokenContract = await SettlementToken.new();
  });

  const addSettlementCurrency = async ({
    id = settlementCurrencyId,
    user = contractOwner,
  } = {}) =>
    loanDappContract.addSettlementCurrency(
      id,
      settlementTokenContract.address,
      {
        from: user.address,
      },
    );

  const getLoanProofData = async ({
    user = borrower,
  } = {}) => {
    const {
      publicKey,
    } = user;
    const notionalNote = await aztec.note.create(publicKey, defaultLoanData.notionalValue);
    const {
      noteHash: notionalNoteHash,
    } = notionalNote.exportNote();

    const newTotalNote = await aztec.note.create(publicKey, defaultLoanData.notionalValue);
    const oldTotalNote = await aztec.note.createZeroValueNote();
    const {
      proofData,
    } = aztec.proof.mint.encodeMintTransaction({
      newTotalMinted: newTotalNote,
      oldTotalMinted: oldTotalNote,
      adjustedNotes: [notionalNote],
      senderAddress: loanDappContract.address,
    });

    return {
      notionalNoteHash,
      proofData,
    };
  };

  it('should allow owner to add settlement currency', async () => {
    const prevAddress = await loanDappContract.settlementCurrencies(settlementCurrencyId);
    assert.equal(+prevAddress, 0);

    await addSettlementCurrency();

    const currencyAddress = await loanDappContract.settlementCurrencies(settlementCurrencyId);
    assert.equal(currencyAddress, settlementTokenContract.address);
  });

  it('should prevent non-owner to add settlement currency', async () => {
    await assertRevert(addSettlementCurrency({
      user: stranger,
    }));

    const currencyAddress = await loanDappContract.settlementCurrencies(settlementCurrencyId);
    assert.equal(+currencyAddress, 0);
  });

  it('should fire an event after adding a settlement currency', async () => {
    const transaction = await addSettlementCurrency();
    const triggeredEvents = web3Events(transaction);
    assert.equal(triggeredEvents.count(), 1);
    triggeredEvents.event('SettlementCurrencyAdded').hasBeenCalledExactlyWith({
      id: settlementCurrencyId,
      settlementAddress: settlementTokenContract.address,
    });
  });

  it('should be able to create a loan', async () => {
    await addSettlementCurrency();

    await assertInvalidOpcode(loanDappContract.loans(0));

    const {
      address,
      publicKey,
    } = borrower;
    const {
      notionalNoteHash,
      proofData,
    } = await getLoanProofData();

    await loanDappContract.createLoan(
      notionalNoteHash,
      defaultLoanData.viewingKey,
      publicKey,
      [
        defaultLoanData.interestRate,
        defaultLoanData.interestPeriod,
        defaultLoanData.loanDuration,
        settlementCurrencyId,
      ],
      proofData,
      {
        from: address,
      },
    );

    const firstLoanAddress = await loanDappContract.loans(0);
    assert.equal(firstLoanAddress > 0, true);
  });

  it('should trigger an event after creating a loan', async () => {
    await addSettlementCurrency();

    await assertInvalidOpcode(loanDappContract.loans(0));

    const {
      address,
      publicKey,
    } = borrower;
    const {
      notionalNoteHash,
      proofData,
    } = await getLoanProofData();

    const transaction = await loanDappContract.createLoan(
      notionalNoteHash,
      defaultLoanData.viewingKey,
      publicKey,
      [
        defaultLoanData.interestRate,
        defaultLoanData.interestPeriod,
        defaultLoanData.loanDuration,
        settlementCurrencyId,
      ],
      proofData,
      {
        from: address,
      },
    );

    const triggeredEvents = web3Events(transaction);
    assert.equal(triggeredEvents.count(), 1);

    const firstLoanAddress = await loanDappContract.loans(0);
    const timestamp = await blockTime.fromTransaction(transaction);

    triggeredEvents.event('LoanCreated').hasBeenCalledWith({
      id: firstLoanAddress,
      notional: notionalNoteHash,
      viewingKey: defaultLoanData.viewingKey,
      loanVariables: [
        defaultLoanData.interestRate,
        defaultLoanData.interestPeriod,
        defaultLoanData.loanDuration,
        settlementCurrencyId,
      ],
      borrower: address,
      createdAt: timestamp,
    });
  });
});
