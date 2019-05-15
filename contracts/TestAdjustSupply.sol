
pragma solidity >= 0.5.0 <0.7.0;


import "@aztec/protocol/contracts/ACE/validators/adjustSupply/AdjustSupply.sol";
import "@aztec/protocol/contracts/ACE/validators/bilateralSwap/BilateralSwap.sol";
import "@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol";
import "@aztec/protocol/contracts/ACE/validators/dividendComputation/DividendComputation.sol";
import "@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol";

contract TestPrivateRange is PrivateRange {

}

contract TestAdjustSupply is AdjustSupply {

}
contract TestBilateralSwap is BilateralSwap {

}
contract TestJoinSplit is JoinSplit {

}

contract TestDividendComputation is DividendComputation {

}
