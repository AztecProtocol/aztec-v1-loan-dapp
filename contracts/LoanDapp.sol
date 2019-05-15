pragma solidity >= 0.5.0 <0.7.0;

import "@aztec/protocol/contracts/interfaces/IAZTEC.sol";
import "@aztec/protocol/contracts/libs/NoteUtils.sol";
import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";
import "./ZKERC20/ZKERC20.sol";
import "./Loan.sol";

contract LoanDapp is IAZTEC {
  using NoteUtils for bytes;

  event SettlementCurrencyAdded(
    uint id,
    address settlementAddress
  );
event LoanApprovedForSettlement(
    address loanId
  );

  event LoanCreated(
    address id,
    address borrower,
    bytes32 notional,
    string viewingKey,
    string borrowerPublicKey,
    uint256[] loanVariables,
    uint createdAt
  );

  address owner = msg.sender;

  address aceAddress;

  uint24 MINT_PRO0F = 66049;
  uint24 BILATERAL_SWAP_PROOF = 65794;
  address[] public loans;

  mapping(uint => address) public settlementCurrencies;

  function _getCurrencyContract(uint _settlementCurrencyId) internal view returns (address) {
    require(settlementCurrencies[_settlementCurrencyId] != address(0), 'Settlement Currency is not defined');
    return settlementCurrencies[_settlementCurrencyId];
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyBorrower(address _loanAddress) {
    Loan loanContract = Loan(_loanAddress);
    require(msg.sender == loanContract.borrower());
    _;
  }

  constructor(address _aceAddress) public {
    aceAddress = _aceAddress;
    viewRequests.push(ViewRequest(
      "",
      ""
    ));
  }

  function addSettlementCurrency(uint _id, address _address) external onlyOwner {
    settlementCurrencies[_id] = _address;
    emit SettlementCurrencyAdded(_id, _address);
  }

  function createLoan(
    bytes32 _notional,
    string calldata _viewingKey,
    string calldata _borrowerPublicKey,
    // bytes32 _noteHash,
    uint256[] calldata _loanVariables,
    // [0] interestRate
    // [1] interestPeriod
    // [2] maturity
    // [3] settlementCurrencyId
    bytes calldata _proofData
    // bytes calldata _signature
  ) external {

  address loanCurrency = _getCurrencyContract(_loanVariables[3]);

     Loan newLoan = new Loan(
      _notional,
      _viewingKey,
      _loanVariables,
      msg.sender,
      aceAddress,
      loanCurrency
    );

    loans.push(address(newLoan));
    Loan loanContract = Loan(address(newLoan));

    loanContract.setProofs(1, uint256(-1));
    loanContract.confidentialMint(MINT_PROOF, bytes(_proofData));

    emit LoanCreated(
      address(newLoan),
      msg.sender,
      _notional,
      _viewingKey,
      _borrowerPublicKey,
      _loanVariables,
      block.timestamp
    );
  }

  function approveLoanNotional(
    bytes32 _noteHash,
    bytes memory _signature,
    address _loanId
  ) public {

    Loan loanContract = Loan(_loanId);
    loanContract.confidentialApprove(_noteHash, _loanId, true, _signature);
    emit LoanApprovedForSettlement(_loanId);
  }


  // Content in LoanViewRequest

  event ViewRequestCreated(
    uint id,
    address loanId,
    address lender,
    string lenderPublicKey
  );

  event ViewRequestAccepted(
    uint id,
    address loanId,
    address lender,
    string sharedSecret
  );

  struct ViewRequest {
    string lenderPublicKey;
    string sharedSecret;
  }

  ViewRequest[] public viewRequests;

  mapping(address => mapping(address => uint)) public lenderToViewRequestId;

  function submitViewRequest(address _loanId, string calldata _lenderPublicKey) external {
    // require loan not settled
    require(lenderToViewRequestId[msg.sender][_loanId] == 0);

    uint viewRequestId = viewRequests.push(ViewRequest(
      _lenderPublicKey,
      ""
    )) - 1;
    lenderToViewRequestId[msg.sender][_loanId] = viewRequestId;

    emit ViewRequestCreated(
      viewRequestId,
      _loanId,
      msg.sender,
      _lenderPublicKey
    );
  }

  function approveViewRequest(
    address _loanId,
    address _lender,
    string calldata _sharedSecret
  ) external onlyBorrower(_loanId) {
    uint viewRequestId = lenderToViewRequestId[_lender][_loanId];
    viewRequests[viewRequestId].sharedSecret = _sharedSecret;

    emit ViewRequestAccepted(
      viewRequestId,
      _loanId,
      _lender,
      _sharedSecret
    );
  }

  event SettlementSuccesfull(
    address indexed from,
    address indexed to,
    address loanId,
    uint256 timestamp
  );

  struct LoanPayment {
    address from;
    address to;
    bytes notional;
  }

  mapping(uint => mapping(uint => LoanPayment)) public loanPayments;


  function settleInitialBalance(
      address _loanId,
      bytes calldata _proofData,
      bytes32 _currentInterestBalance
  ) external {
    Loan loanContract = Loan(_loanId);
    loanContract.settleLoan(_proofData, _currentInterestBalance, msg.sender);
    emit SettlementSuccesfull(
      msg.sender,
      loanContract.borrower(),
      _loanId,
      block.timestamp
    );
  }
}
