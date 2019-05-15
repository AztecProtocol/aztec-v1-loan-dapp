const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const AdjustSupply = artifacts.require('@aztec/protocol/contracts/ACE/validators/adjustSupply/AdjustSupply.sol');
const BilateralSwap = artifacts.require('@aztec/protocol/contracts/ACE/validators/bilateralSwap/BilateralSwap.sol');
const DividendComputation = artifacts.require('@aztec/protocol/contracts/ACE/validators/dividendComputation/DividendComputation.sol');

// remove all paths except name
const JoinSplit = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');
const PrivateRange = artifacts.require('@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol');
const utils = require('@aztec/dev-utils');

const {
  constants,
  proofs: {
    BOGUS_PROOF,
    JOIN_SPLIT_PROOF,
    MINT_PROOF,
    BILATERAL_SWAP_PROOF,
    DIVIDEND_PROOF,
    PRIVATE_RANGE_PROOF,
  },
} = utils;

module.exports = async (deployer, network) => {
  if (network === 'development' || network === 'test') {
    await deployer.deploy(ACE);
    await deployer.deploy(AdjustSupply);
    await deployer.deploy(BilateralSwap);
    await deployer.deploy(JoinSplit);
    await deployer.deploy(DividendComputation);
    await deployer.deploy(PrivateRange);
    const ACEContract = await ACE.deployed();
    const AdjustSupplyContract = await AdjustSupply.deployed();
    await ACEContract.setCommonReferenceString(constants.CRS);
    await ACEContract.setProof(MINT_PROOF, AdjustSupplyContract.address);
    await ACEContract.setProof(BILATERAL_SWAP_PROOF, BilateralSwap.address);
    await ACEContract.setProof(DIVIDEND_PROOF, DividendComputation.address);
    await ACEContract.setProof(JOIN_SPLIT_PROOF, JoinSplit.address);
    await ACEContract.setProof(PRIVATE_RANGE_PROOF, PrivateRange.address);
  }
};
