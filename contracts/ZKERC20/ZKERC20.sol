pragma solidity >= 0.5.0 <0.7.0;

import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";

contract ZKERC20 is ZkAsset {

  event Log(address owner, uint256 value, bytes32 noteHash);
  event LogString(string value);
  address aceAddress;
  address public erc20Address;

  constructor(
    address _aceAddress,
    address _erc20Address
   ) public ZkAsset(_aceAddress, address(_erc20Address), 1, false, true) {
     aceAddress = _aceAddress;
     erc20Address = _erc20Address;
  }

  function approveAceToSpendTokens(bytes32 _proofHash, uint256 _value) public {

    ACE aceContract = ACE(aceAddress);
    aceContract.publicApprove(address(this), _proofHash, _value);
    emit Log(aceAddress, _value, _proofHash);
  }


}
