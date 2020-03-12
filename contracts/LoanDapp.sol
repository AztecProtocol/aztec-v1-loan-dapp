pragma solidity >= 0.5.0 <0.6.0;

import "@aztec/protocol/contracts/interfaces/IAZTEC.sol";
import "@aztec/protocol/contracts/libs/NoteUtils.sol";
import "./LoanDappUtilities.sol";
import "./interfaces/ILoan.sol";

contract LoanDapp is IAZTEC {
  using LoanDappUtilities for LoanDappUtilities.LoanDappVariables;
  using NoteUtils for bytes;
  LoanDappUtilities.LoanDappVariables public loanDappVariables;

  event LoanApprovedForSettlement(
    address loanId
  );

  event LoanId(address variable);

  event LoanCreated(
    address id,
    address borrower,
    bytes32 notional,
    string borrowerPublicKey,
    uint256[] loanVariables,
    uint createdAt
  );

  event ViewRequestCreated(
    address loanId,
    address lender,
    string lenderPublicKey
  );

  event ViewRequestApproved(
    uint accessId,
    address loanId,
    address user,
    string sharedSecret
  );

  event SettlementCurrencyAdded(
    uint id,
    address settlementAddress
  );

  event SettlementSuccesfull(
    address indexed from,
    address indexed to,
    address loanId,
    uint256 timestamp
  );

  event NoteAccessApproved(
    uint accessId,
    bytes32 note,
    address user,
    string sharedSecret
  );

  address owner = msg.sender;
  address aceAddress;

  uint24 SWAP_PROOF = 65794;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyBorrower(address _loanAddress) {
    ILoan loanContract = ILoan(_loanAddress);
    require(msg.sender == loanContract.borrower());
    _;
  }

  constructor(address _aceAddress) public {
    aceAddress = _aceAddress;
  }

  function loans(uint256 Id) public view returns (address) {
    address loanId = loanDappVariables.loans[Id];
    return loanId;
  }

  function settlementCurrencies(uint256 Id) public view returns (address) {
    return loanDappVariables.settlementCurrencies[Id];
  }

  function addSettlementCurrency(uint _id, address _address) external onlyOwner {
    loanDappVariables.settlementCurrencies[_id] = _address;
    emit SettlementCurrencyAdded(_id, _address);
  }

  function createLoan(
    bytes32 _notional,
    string calldata _viewingKey,
    string calldata _borrowerPublicKey,
    uint256[] calldata _loanVariables,
    // [0] interestRate
    // [1] interestPeriod
    // [2] loanDuration
    // [3] settlementCurrencyId
    bytes calldata _proofData
  ) external {

    address loanId = LoanDappUtilities.createLoan(_notional, _loanVariables, _proofData, aceAddress, loanDappVariables);

    emit LoanCreated(
      loanId,
      msg.sender,
      _notional,
      _borrowerPublicKey,
      _loanVariables,
      block.timestamp
    );

    _approveNoteAccess(
      _notional,
      msg.sender,
      _viewingKey
    );
  }

  function approveLoanNotional(
    bytes32 _noteHash,
    bytes memory _signature,
    address _loanId
  ) public {
    ILoan loanContract = ILoan(_loanId);
    loanContract.confidentialApprove(_noteHash, _loanId, true, _signature);
    emit LoanApprovedForSettlement(_loanId);
  }

  function submitViewRequest(address _loanId, string calldata _lenderPublicKey) external {
    emit ViewRequestCreated(
      _loanId,
      msg.sender,
      _lenderPublicKey
    );
  }

  function _approveNoteAccess(
    bytes32 _note,
    address _userAddress,
    string memory _sharedSecret
  ) internal {
    uint accessId = LoanDappUtilities._generateAccessId(_note, _userAddress);
    emit NoteAccessApproved(
      accessId,
      _note,
      _userAddress,
      _sharedSecret
    );
  }


  function approveViewRequest(
    address _loanId,
    address _lender,
    bytes32 _notionalNote,
    string calldata _sharedSecret
  ) external onlyBorrower(_loanId) {
    uint accessId = LoanDappUtilities._generateAccessId(_notionalNote, _lender);

    emit ViewRequestApproved(
      accessId,
      _loanId,
      _lender,
      _sharedSecret
    );
  }

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
    ILoan loanContract = ILoan(_loanId);
    loanContract.settleLoan(_proofData, _currentInterestBalance, msg.sender);
    emit SettlementSuccesfull(
      msg.sender,
      loanContract.borrower(),
      _loanId,
      block.timestamp
    );
  }

  function approveNoteAccess(
    bytes32 _note,
    string calldata _viewingKey,
    string calldata _sharedSecret,
    address _sharedWith
  ) external {
    if (bytes(_viewingKey).length != 0) {
      _approveNoteAccess(
        _note,
        msg.sender,
        _viewingKey
      );
    }

    if (bytes(_sharedSecret).length != 0) {
      _approveNoteAccess(
        _note,
        _sharedWith,
        _sharedSecret
      );
    }
  }
}
