/* global artifacts contract assert */
import moment from 'moment';
import loanSettlement from './helpers/loanSettlement';
import timeHelpers from './helpers/truffleTestHelpers';


const LoanDapp = artifacts.require('./LoanDapp.sol');
const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const Swap = artifacts.require('@aztec/protocol/contracts/ACE/validators/swap/Swap.sol');
const JoinSplit = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');
const SettlementToken = artifacts.require('./SettlementToken.sol');
const ZKERC20 = artifacts.require('./ZKERC20.sol');
const Loan = artifacts.require('./Loan.sol');


contract('LoanInterest', async (accounts) => {
  let loanDappContract;
  let settlementToken;
  let zkerc20Contract;
  let joinSplitContract;
  let aceContract;
  let swap;
  let LoanSettlementService;
  let loan;

  beforeEach(async () => {
    const ace = await ACE.deployed();
    loanDappContract = await LoanDapp.new(ace.address);
    settlementToken = await SettlementToken.deployed();
    joinSplitContract = await JoinSplit.deployed();
    swap = await Swap.deployed();
    zkerc20Contract = await ZKERC20.deployed();
    aceContract = await ACE.deployed();
    const settlementTokenContractAddress = zkerc20Contract.address;

    LoanSettlementService = loanSettlement({
      aceContract,
      zkerc20Contract,
      settlementToken,
      joinSplitContract,
      loanDappContract,
      accounts,
    });
    await LoanSettlementService.addSettlementCurrency();
    const loanContractAddress = await LoanSettlementService.createLoan();
    loan = await Loan.at(loanContractAddress);
    await LoanSettlementService.settleLoan();
    await timeHelpers.advanceTimeAndBlock(10 * 86400);
  });

  it('should be able to widthdaw interest on a loan', async () => {
    const { proofs: [proofData1, proofData2] } = await LoanSettlementService.withdrawInterest(10000, 5570);
    await loan.withdrawInterest(
      proofData1,
      proofData2,
      5570,
    );
  });

  it('the borrower should be able to widthdaw the balance on a loan', async () => {
    const proofData1 = await LoanSettlementService.withdrawBalance(300);

    await loan.adjustInterestBalance(
      proofData1,
      { from: accounts[1] },
    );
  });


  it('should be able to mark the loan as default if balance is not sufficient', async () => {
    const proofData = await LoanSettlementService.withdrawBalance(9990);

    await loan.adjustInterestBalance(
      proofData,
      { from: accounts[1] },
    );
    await timeHelpers.advanceTimeAndBlock(86400 * 35);
    const {
      proofs: [proofData1],
      notes: { withdrawInterestNote },
    } = await LoanSettlementService.withdrawInterest(10, 1 * 86400);
    const proofData2 = await LoanSettlementService.defaultLoan(withdrawInterestNote);

    await loan.markLoanAsDefault(
      proofData1,
      proofData2,
      86400,
    );
  });

  it('should be able to repay a loan', async () => {
    const withdrawProof = await LoanSettlementService.withdrawBalance(10000);
    await loan.adjustInterestBalance(
      withdrawProof,
      { from: accounts[1] },
    );
    // remaining periods * notional * rate
    const depositProof = await LoanSettlementService.depositBalance(1 * 10000 * 0.5);

    await timeHelpers.advanceTimeAndBlock(86400 * 30);
    await loan.adjustInterestBalance(
      depositProof,
      { from: accounts[1] },
    );

    const {
      proofs: [proofData1],
      notes: { withdrawInterestNote, changeNote },
    } = await LoanSettlementService.withdrawInterest(0 + (1 * 10000 * 0.5), 86400 * 1);
    const [proofData3] = await LoanSettlementService.repayLoan(withdrawInterestNote, changeNote);

    await loan.repayLoan(
      proofData1,
      proofData3,
      { from: accounts[1] },
    );
  });
});
