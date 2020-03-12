
pragma solidity >= 0.5.0 <0.6.0;


import "@aztec/protocol/contracts/ACE/validators/joinSplitFluid/joinSplitFluid.sol";
import "@aztec/protocol/contracts/ACE/validators/swap/Swap.sol";
import "@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol";
import "@aztec/protocol/contracts/ACE/validators/dividend/Dividend.sol";
import "@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol";

contract TestPrivateRange is PrivateRange {

}

contract TestJoinSplitFluid is JoinSplitFluid {

}
contract TestSwap is Swap {

}
contract TestJoinSplit is JoinSplit {

}

contract TestDividend is Dividend {

}
