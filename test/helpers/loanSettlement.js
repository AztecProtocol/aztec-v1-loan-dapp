import utils from '@aztec/dev-utils';
import moment from 'moment';

const {
  signer,
  note,
  JoinSplitProof,
  DividendProof,
  SwapProof,
  PrivateRangeProof,
  MintProof,
} = require('aztec.js');
const dotenv = require('dotenv');
const secp256k1 = require('@aztec/secp256k1');


dotenv.config();
const lender = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_2);

const defaultLoanData = {
  notional: 10000,
  notionalNote: undefined,
  viewingKey: '0x0368bac945f9aab61b51539fc295f0319b47cd89fb850dfb59a5676acad586d0c9',
  interestRate: 5000,
  interestPeriod: 1 * 86400,
  maturity: 1 * 86400,
  settlementCurrencyId: 0,
};


const loanData = defaultLoanData;
const borrower = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_1);

const signNote = (validatorAddress, noteHash, spender, privateKey) => {
  const domain = signer.generateZKAssetDomainParams(validatorAddress);
  const schema = utils.constants.eip712.NOTE_SIGNATURE;
  const status = true;
  const message = {
    noteHash,
    spender,
    status,
  };
  const { signature } = signer.signTypedData(domain, schema, message, privateKey);

  return signature[0] + signature[1].slice(2) + signature[2].slice(2);
};


const computeRemainderNoteValue = (value, za, zb) => {
  const expectedNoteValue = Math.floor(value * (za / zb));
  const remainder = value * za - expectedNoteValue * zb;

  return {
    remainder,
    expectedNoteValue,
  };
};

// https://stackoverflow.com/questions/23575218/convert-decimal-number-to-fraction-in-javascript-or-closest-fraction


function getFraction(value, maxdenom) {
  const best = { numerator: 1, denominator: 1, err: Math.abs(value - 1) };
  if (!maxdenom) maxdenom = 10000;
  for (let denominator = 1; best.err > 0 && denominator <= maxdenom; denominator++) {
    const numerator = Math.round(value * denominator);
    const err = Math.abs(value - numerator / denominator);
    if (err >= best.err) continue;
    best.numerator = numerator;
    best.denominator = denominator;
    best.err = err;
  }
  return best;
}


export default ({
  aceContract,
  zkerc20Contract,
  settlementToken,
  joinSplitContract,
  loanDappContract,
  accounts,
}) => {
  const mintSettlementNote = async (value, account) => {
    const settlementNote = await note.create(account.publicKey, value);
    const loanId = await loanDappContract.loans(0);
    await settlementToken.giveAddressDevBalance(account.address, value, {
      from: account.address,
    });
    await settlementToken.approve(aceContract.address, value, {
      from: account.address,
    });

    const proof = new JoinSplitProof(
      [],
      [settlementNote],
      account.address,
      -value,
      account.address,
    );

    const hashProof = proof.hash;
    const proofData = proof.encodeABI(zkerc20Contract.address);

    await aceContract.publicApprove(zkerc20Contract.address, hashProof, value, {
      from: account.address,
    });

    // await aceContract.publicApprove(loanId, hashProof, value, {
    //   from: account.address,
    // });

    await zkerc20Contract.confidentialTransfer(proofData, signatures, {
      from: account.address,
    });

    return settlementNote;
  };

  return {
    settleLoan: async () => {
      const settlementNote = await mintSettlementNote(defaultLoanData.notional, lender);
      const {
        noteHash: signatureNoteHash,
      } = settlementNote.exportNote();

      const loanId = await loanDappContract.loans(0);
      const takerBid = defaultLoanData.notionalNote; // the current loan note
      const takerAsk = await note.create(borrower.publicKey, defaultLoanData.notional, loanId);
      defaultLoanData.currentInterestBalance = takerAsk;
      const makerBid = settlementNote;
      const makerAsk = settlementNote;


      const settlementSignature = signNote(zkerc20Contract.address, signatureNoteHash, loanId, lender.privateKey);

      await zkerc20Contract.confidentialApprove(signatureNoteHash, loanId, true, settlementSignature, {
        from: lender.address,
      });

      const { noteHash: currentBalanceHash } = defaultLoanData.currentInterestBalance.exportNote();

      const swapProof = new SwapProof(
        [takerBid, takerAsk],
        [makerAsk, makerBid],
        loanId,
      );

      const swapProofData = swapProof.encodeABI();

      // defaultLoanData.notionalNote = settlementNote;

      await loanDappContract.settleInitialBalance(
        loanId,
        swapProofData,
        currentBalanceHash,
        {
          from: lender.address,
        },
      );
    },
    createLoan: async () => {
      const loanNote = await note.create(borrower.publicKey, defaultLoanData.notional);
      const newTotalNote = await note.create(borrower.publicKey, defaultLoanData.notional);
      const oldTotalNote = await note.createZeroValueNote();
      const {
        noteHash: loanNoteHash,
        publicKey: loanPublicKey,
      } = loanNote.exportNote();

      defaultLoanData.notionalNote = loanNote;
      const proof = new MintProof(
        newTotalNote,
        oldTotalNote,
        [loanNote],
        loanDappContract.address,
      );

      const proofData = proof.encodeABI();

      const loan = await loanDappContract.createLoan(
        loanNoteHash,
        loanData.viewingKey,
        borrower.publicKey,
        // loanNoteHash,
        [
          loanData.interestRate,
          loanData.interestPeriod,
          loanData.maturity,
          loanData.settlementCurrencyId,
          1,
          1,
        ],
        proofData,
        // loanSignature,
        {
          from: accounts[1],
        },
      );
      const loanId = await loanDappContract.loans(0);
      const loanSignature = signNote(loanId, loanNote.noteHash, loanId, borrower.privateKey);
      await loanDappContract.approveLoanNotional(
        loanNoteHash,
        loanSignature,
        loanId,
      );
      // const loanId = numberOfLoans;
      // numberOfLoans += 1;
      return loanId;
    },
    addSettlementCurrency: async () => {
      await loanDappContract.addSettlementCurrency(
        defaultLoanData.settlementCurrencyId,
        zkerc20Contract.address,
        {
          from: accounts[0],
        },
      );
    },
    withdrawInterest: async (currentBalance, duration) => {
      // if currentBalance is 0 we have to change this as the ratio is infinite
      //
      const { notionalNote, currentInterestBalance } = defaultLoanData;
      const currentInterest = currentBalance;


      const loanId = await loanDappContract.loans(0);
      const ratio1 = getFraction(defaultLoanData.interestPeriod / (duration * defaultLoanData.interestRate) * 10000);
      const withdrawInterest = computeRemainderNoteValue(notionalNote.k.toNumber(), ratio1.denominator, ratio1.numerator);

      const remainderNote2 = await note.create(lender.publicKey, withdrawInterest.remainder);
      const withdrawInterestNote = await note.create(lender.publicKey, withdrawInterest.expectedNoteValue, lender.address);

      const proof1 = new DividendProof(
        [notionalNote],
        [withdrawInterestNote, remainderNote2],
        ratio1.numerator,
        ratio1.denominator,
        loanId,
      );

      const proofData1 = proof1.encodeABI();

      let changeValue = currentInterest - withdrawInterest.expectedNoteValue;
      changeValue = changeValue < 0 ? 0 : changeValue;


      const changeNote = await note.create(borrower.publicKey, changeValue, loanId);
      const proof2 = new JoinSplitProof(
        [currentInterestBalance],
        [withdrawInterestNote, changeNote],
        loanId,
        0,
        borrower.address,
      );

      const proofData2 = proof2.encodeABI();

      return {
        proofs: [proofData1, proofData2],
        notes: {
          changeNote,
          withdrawInterestNote,
        },
      };
    },
    withdrawBalance: async (withdrawAmount) => {
      const { currentInterestBalance } = defaultLoanData;
      const loanId = await loanDappContract.loans(0);
      const changeNote = await note.create(borrower.publicKey, currentInterestBalance.k.toNumber() - withdrawAmount, loanId);
      defaultLoanData.currentInterestBalance = changeNote;
      const withdrawNote = await note.create(borrower.publicKey, withdrawAmount);
      // withdraw
      const proof = new JoinSplitProof(
        [currentInterestBalance],
        [withdrawNote, changeNote],
        loanId,
        0,
        borrower.address,
      );

      const proofData = proof.encodeABI(loanId);

      return proofData;
    },
    depositBalance: async (amount) => {
      const { currentInterestBalance } = defaultLoanData;
      const loanId = await loanDappContract.loans(0);
      const changeNote = await note.create(borrower.publicKey, currentInterestBalance.k.toNumber() + amount, loanId);
      defaultLoanData.currentInterestBalance = changeNote;
      const withdrawNote = await note.create(borrower.publicKey, 0);
      const settlementNote = await mintSettlementNote(amount, borrower);

      const { noteHash } = settlementNote.exportNote();

      const signature = signNote(zkerc20Contract.address, noteHash, loanId, borrower.privateKey);

      await zkerc20Contract.confidentialApprove(noteHash, loanId, true, signature, {
        from: borrower.address,
      });
      // withdraw
      const proof = new JoinSplitProof(
        [currentInterestBalance, settlementNote],
        [withdrawNote, changeNote],
        loanId,
        0,
        borrower.address,
      );
      const proofData = proof.encodeABI();
      return proofData;
    },

    borrower,
    lender,
    defaultLoan: async (withdrawInterest) => {
      const loanId = await loanDappContract.loans(0);

      const { proofData } = new PrivateRangeProof(
        withdrawInterest,
        defaultLoanData.currentInterestBalance,
        loanId,
      );
      return proofData;
    },
    repayLoan: async (outstandingInterest, changeNote) => {
      const changeValue = changeNote.k.toNumber();

      const remainingValue = defaultLoanData.notional - changeValue;
      const lenderRepaymentNote = await note.create(lender.publicKey, defaultLoanData.notional, lender.address);
      const borrowerRepaymentNote = await mintSettlementNote(remainingValue, borrower);
      const { noteHash } = borrowerRepaymentNote.exportNote();

      const loanId = await loanDappContract.loans(0);
      const repaymentSignature = signNote(zkerc20Contract.address, noteHash, loanId, borrower.privateKey);

      await zkerc20Contract.confidentialApprove(noteHash, loanId, true, repaymentSignature, {
        from: borrower.address,
      });


      const { proofData: proof3Data } = new JoinSplitProof(
        [defaultLoanData.currentInterestBalance, borrowerRepaymentNote],
        [outstandingInterest, lenderRepaymentNote],
        loanId,
        0,
        lender.address,
      );

      return [proof3Data];
    },


  };
};
