import utils from '@aztec/dev-utils';
import moment from 'moment';

const aztec = require('aztec.js');
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
  const domain = aztec.signer.generateZKAssetDomainParams(validatorAddress);
  const schema = utils.constants.eip712.NOTE_SIGNATURE;
  const status = true;
  const message = {
    noteHash,
    spender,
    status,
  };
  const { signature } = aztec.signer.signTypedData(domain, schema, message, privateKey);

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
    const settlementNote = await aztec.note.create(account.publicKey, value);
    const loanId = await loanDappContract.loans(0);
    await settlementToken.giveAddressDevBalance(account.address, value, {
      from: account.address,
    });
    await settlementToken.approve(aceContract.address, value, {
      from: account.address,
    });

    const { proofData, expectedOutput, signatures } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
      inputNotes: [],
      outputNotes: [settlementNote],
      senderAddress: account.address,
      inputNoteOwners: [],
      publicOwner: account.address,
      kPublic: -value,
      validatorAddress: joinSplitContract.address,
    });

    const proofOutput = aztec.abiEncoder.outputCoder.getProofOutput(expectedOutput, 0);
    const hashProof = aztec.abiEncoder.outputCoder.hashProofOutput(proofOutput);

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
      const takerAsk = await aztec.note.create(borrower.publicKey, defaultLoanData.notional, loanId);
      defaultLoanData.currentInterestBalance = takerAsk;
      const makerBid = settlementNote;
      const makerAsk = settlementNote;


      const settlementSignature = signNote(zkerc20Contract.address, signatureNoteHash, loanId, lender.privateKey);

      await zkerc20Contract.confidentialApprove(signatureNoteHash, loanId, true, settlementSignature, {
        from: lender.address,
      });

      const { noteHash: currentBalanceHash } = defaultLoanData.currentInterestBalance.exportNote();

      const {
        proofData: bilateralSwapProofData,
      } = aztec.proof.bilateralSwap.encodeBilateralSwapTransaction({
        inputNotes: [takerBid, takerAsk],
        outputNotes: [makerAsk, makerBid],
        senderAddress: loanId,
      });

      // defaultLoanData.notionalNote = settlementNote;

      await loanDappContract.settleInitialBalance(
        loanId,
        bilateralSwapProofData,
        currentBalanceHash,
        {
          from: lender.address,
        },
      );
    },
    createLoan: async () => {
      const loanNote = await aztec.note.create(borrower.publicKey, defaultLoanData.notional);
      const newTotalNote = await aztec.note.create(borrower.publicKey, defaultLoanData.notional);
      const oldTotalNote = await aztec.note.createZeroValueNote();
      const {
        noteHash: loanNoteHash,
        publicKey: loanPublicKey,
      } = loanNote.exportNote();

      defaultLoanData.notionalNote = loanNote;
      const {
        proofData,
      } = aztec.proof.mint.encodeMintTransaction({
        newTotalMinted: newTotalNote,
        oldTotalMinted: oldTotalNote,
        adjustedNotes: [loanNote],
        senderAddress: loanDappContract.address,
      });

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

      const remainderNote2 = await aztec.note.create(lender.publicKey, withdrawInterest.remainder);
      const withdrawInterestNote = await aztec.note.create(lender.publicKey, withdrawInterest.expectedNoteValue, lender.address);

      const { proofData: proofData1 } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
        inputNotes: [notionalNote],
        outputNotes: [withdrawInterestNote, remainderNote2],
        za: ratio1.numerator,
        zb: ratio1.denominator,
        senderAddress: loanId,
      });

      let changeValue = currentInterest - withdrawInterest.expectedNoteValue;
      changeValue = changeValue < 0 ? 0 : changeValue;


      const changeNote = await aztec.note.create(borrower.publicKey, changeValue, loanId);
      const { proofData: proofData2 } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
        inputNotes: [currentInterestBalance],
        outputNotes: [withdrawInterestNote, changeNote],
        inputNoteOwners: [],
        senderAddress: loanId,
        publicOwner: borrower.address,
        kPublic: 0,
      });

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
      const changeNote = await aztec.note.create(borrower.publicKey, currentInterestBalance.k.toNumber() - withdrawAmount, loanId);
      defaultLoanData.currentInterestBalance = changeNote;
      const withdrawNote = await aztec.note.create(borrower.publicKey, withdrawAmount);
      // withdraw
      const { proofData } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
        inputNotes: [currentInterestBalance],
        outputNotes: [withdrawNote, changeNote],
        inputNoteOwners: [],
        senderAddress: loanId,
        publicOwner: borrower.address,
        kPublic: 0,
      });

      return proofData;
    },
    depositBalance: async (amount) => {
      const { currentInterestBalance } = defaultLoanData;
      const loanId = await loanDappContract.loans(0);
      const changeNote = await aztec.note.create(borrower.publicKey, currentInterestBalance.k.toNumber() + amount, loanId);
      defaultLoanData.currentInterestBalance = changeNote;
      const withdrawNote = await aztec.note.create(borrower.publicKey, 0);
      const settlementNote = await mintSettlementNote(amount, borrower);

      const { noteHash } = settlementNote.exportNote();

      const signature = signNote(zkerc20Contract.address, noteHash, loanId, borrower.privateKey);

      await zkerc20Contract.confidentialApprove(noteHash, loanId, true, signature, {
        from: borrower.address,
      });
      // withdraw
      const { proofData } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
        inputNotes: [currentInterestBalance, settlementNote],
        inputNoteOwners: [],
        outputNotes: [withdrawNote, changeNote],
        senderAddress: loanId,
        publicOwner: borrower.address,
        kPublic: 0,
      });
      return proofData;
    },

    borrower,
    lender,
    defaultLoan: async (withdrawInterest) => {
      const loanId = await loanDappContract.loans(0);

      const { proofData } = await aztec.proof.privateRange.encodePrivateRangeTransaction({
        originalNote: withdrawInterest,
        comparisonNote: defaultLoanData.currentInterestBalance,
        senderAddress: loanId,
      });
      return proofData;
    },
    repayLoan: async (outstandingInterest, changeNote) => {
      const changeValue = changeNote.k.toNumber();

      const remainingValue = defaultLoanData.notional - changeValue;
      const lenderRepaymentNote = await aztec.note.create(lender.publicKey, defaultLoanData.notional, lender.address);
      const borrowerRepaymentNote = await mintSettlementNote(remainingValue, borrower);
      const { noteHash } = borrowerRepaymentNote.exportNote();

      const loanId = await loanDappContract.loans(0);
      const repaymentSignature = signNote(zkerc20Contract.address, noteHash, loanId, borrower.privateKey);

      await zkerc20Contract.confidentialApprove(noteHash, loanId, true, repaymentSignature, {
        from: borrower.address,
      });


      const { proofData: proof3Data } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
        inputNotes: [defaultLoanData.currentInterestBalance, borrowerRepaymentNote],
        inputNoteOwners: [],
        outputNotes: [outstandingInterest, lenderRepaymentNote],
        senderAddress: loanId,
        publicOwner: lender.address,
        kPublic: 0,
      });

      return [proof3Data];
    },


  };
};
