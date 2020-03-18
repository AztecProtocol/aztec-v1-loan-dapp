/* global artifacts */
import dotenv from 'dotenv';
import asyncForEach from '../utils/asyncForEach';

const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const LoanDapp = artifacts.require('./LoanDapp.sol');
const SettlementToken = artifacts.require('./SettlementToken.sol');

const { note, MintProof } = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

dotenv.config();

const defaultSettlementCurrencyId = 1;

const defaultLoanData = {
  notionalValue: 10000,
  viewingKey: '0x0368bac945f9aab61b51539fc295f0319b47cd89fb850dfb59a5676acad586d0c9',
  interestRate: 1000, // 10%
  interestPeriod: 1 * 86400,
  loanDuration: 10 * 86400,
};

const getLoanProofData = async ({
  loanData,
  user,
  loanDappContract,
} = {}) => {
  const {
    publicKey,
  } = user;
  const notionalNote = await note.create(publicKey, loanData.notionalValue);
  const {
    noteHash: notionalNoteHash,
  } = notionalNote.exportNote();

  const newTotalNote = await note.create(publicKey, loanData.notionalValue);
  const oldTotalNote = await note.createZeroValueNote();
  const proof = new MintProof(
    oldTotalNote,
    newTotalNote,
    [notionalNote],
    loanDappContract.address,
  );

  const proofData = proof.encodeABI();

  return {
    notionalNoteHash,
    proofData,
  };
};

class LoanService {
  constructor({
    loanData = defaultLoanData,
    contractOwner = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_0),
    borrower = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_1),
    lender = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_2),
    settlementCurrencyId = defaultSettlementCurrencyId,
    settlementTokenContract = null,
    loanDappContract = null,
  } = {}) {
    this.loanData = loanData;
    this.contractOwner = contractOwner;
    this.borrower = borrower;
    this.lender = lender;
    this.settlementCurrencyId = settlementCurrencyId;
    this.settlementTokenContract = settlementTokenContract;
    this.loanDappContract = loanDappContract;

    this.orderedStep = [
      'newLoanDappContract',
      'newSettlementTokenContract',
      'addSettlementCurrency',
      'createLoan',
      'submitViewRequest',
      'approveViewRequest',
    ];

    this.startAtStep = 0;
  }

  advanceToStep = async (step) => {
    const stepIndex = this.orderedStep.indexOf(step);
    if (stepIndex < 0) return;

    const steps = this.orderedStep.slice(this.startAtStep, stepIndex + 1);
    await asyncForEach(steps, async (stepName) => {
      await this[stepName]();
    });
    this.startAtStep = stepIndex + 1;
  };

  newLoanDappContract = async () => {
    const ace = await ACE.deployed();
    this.loanDappContract = await LoanDapp.new(ace.address);
    return this.loanDappContract;
  };

  newSettlementTokenContract = async () => {
    this.settlementTokenContract = await SettlementToken.new();
    return this.settlementTokenContract;
  };

  addSettlementCurrency = async ({
    id = this.settlementCurrencyId,
    user = this.contractOwner,
    settlementTokenContract = this.settlementTokenContract,
  } = {}) => {
    const transaction = await this.loanDappContract.addSettlementCurrency(
      id,
      settlementTokenContract.address,
      {
        from: user.address,
      },
    );

    if (id === this.settlementCurrencyId) {
      this.settlementTokenContract = settlementTokenContract;
    }

    return transaction;
  };

  createLoan = async ({
    user = this.borrower,
  } = {}) => {
    let {
      notionalNoteHash,
      proofData,
    } = this.loanData;
    const verifiedProof = await getLoanProofData({
      loanData: this.loanData,
      user,
      loanDappContract: this.loanDappContract,
    });
    if (!notionalNoteHash) {
      ({ notionalNoteHash } = verifiedProof);
    }
    if (!proofData) {
      ({ proofData } = verifiedProof);
    }

    const {
      viewingKey,
      interestRate,
      interestPeriod,
      loanDuration,
    } = this.loanData;

    const transaction = this.loanDappContract.createLoan(
      notionalNoteHash,
      viewingKey,
      user.publicKey,
      [
        interestRate,
        interestPeriod,
        loanDuration,
        this.settlementCurrencyId,
      ],
      proofData,
      {
        from: user.address,
      },
    );

    const loanId = await this.loanDappContract.loans(0);
    this.loanData = {
      ...this.loanData,
      loanId,
      notionalNoteHash,
      proofData,
      settlementCurrencyId: this.settlementCurrencyId,
    };

    return transaction;
  };

  submitViewRequest = async ({
    user = this.lender,
  } = {}) => {
    const {
      loanId,
    } = this.loanData;

    return this.loanDappContract.submitViewRequest(
      loanId,
      user.publicKey,
      {
        from: user.address,
      },
    );
  };

  approveViewRequest = async ({
    lender = this.lender,
    user = this.borrower,
  } = {}) => {
    const {
      loanId,
      notionalNoteHash,
    } = this.loanData;
    const sharedSecret = 'cf0767120273c3fc4046f6061618c2a502fc8b8';

    return this.loanDappContract.approveViewRequest(
      loanId,
      lender.address,
      notionalNoteHash,
      sharedSecret,
      {
        from: user.address,
      },
    );
  };
}

export default LoanService;
