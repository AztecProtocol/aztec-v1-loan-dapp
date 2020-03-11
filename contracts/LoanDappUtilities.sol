pragma solidity >= 0.5.0 <0.6.0;
import "./Loan.sol";

library LoanDappUtilities {

  uint24 constant MINT_PROOF = 66049;

  struct LoanDappVariables {
    uint256 trial;
    mapping(uint => address) settlementCurrencies;
    address[] loans;
  }

  function _getCurrencyContract(uint _settlementCurrencyId, LoanDappVariables storage loanDappVariables) public view returns (address) {
    require(loanDappVariables.settlementCurrencies[_settlementCurrencyId] != address(0), 'Settlement Currency is not defined');
    return loanDappVariables.settlementCurrencies[_settlementCurrencyId];
  }

  function _generateAccessId(bytes32 _note, address _user) public pure returns (uint) {
    return uint(keccak256(abi.encodePacked(_note, _user)));
  }

  function createLoan(
    bytes32 _notional,
    uint256[] calldata _loanVariables,
    bytes calldata _proofData,
    address aceAddress,
    LoanDappVariables storage loanDappVariables
  ) external returns (address) {
    address loanId = _createLoan(_notional, _loanVariables, _proofData, aceAddress, loanDappVariables);
    return loanId;
  } 


  function _createLoan(
    bytes32 _notional,
    uint256[] memory _loanVariables,
    bytes memory _proofData,
    address aceAddress,
    LoanDappVariables storage loanDappVariables
  ) private returns (address) {
    address loanCurrency = _getCurrencyContract(_loanVariables[3], loanDappVariables);

    Loan newLoan = new Loan(
      _notional,
      _loanVariables,
      msg.sender,
      aceAddress,
      loanCurrency
    );

    loanDappVariables.loans.push(address(newLoan));
    Loan loanContract = Loan(address(newLoan));

    loanContract.setProofs(1, uint256(-1));
    loanContract.confidentialMint(MINT_PROOF, bytes(_proofData));

    return address(newLoan);
  }
}
