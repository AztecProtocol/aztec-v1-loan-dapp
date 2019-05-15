pragma solidity >= 0.5.0 <0.7.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract SettlementToken is ERC20 {
  function giveAddressDevBalance(address _account, uint256 _value) public {
    _mint(_account, _value);
  }
}
