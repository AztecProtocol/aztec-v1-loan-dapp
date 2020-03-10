/* globals artifacts */
const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const JoinSplitFluid = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplitFluid/JoinSplitFluid.sol');
const Swap = artifacts.require('@aztec/protocol/contracts/ACE/validators/swap/Swap.sol');
const Dividend = artifacts.require('@aztec/protocol/contracts/ACE/validators/dividend/Dividend.sol');

// remove all paths except name
const JoinSplit = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');
const PrivateRange = artifacts.require('@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol');
const bn128 = require('@aztec/bn128');
const utils = require('@aztec/dev-utils');

const {
  proofs: {
    JOIN_SPLIT_PROOF,
    MINT_PROOF,
    SWAP_PROOF,
    DIVIDEND_PROOF,
    PRIVATE_RANGE_PROOF,
  },
} = utils;

module.exports = async (deployer, network) => {
  if (network === 'development' || network === 'test') {
    await deployer.deploy(ACE);
    await deployer.deploy(JoinSplitFluid);
    await deployer.deploy(Swap);
    await deployer.deploy(JoinSplit);
    await deployer.deploy(Dividend);
    await deployer.deploy(PrivateRange);
    const ACEContract = await ACE.deployed();
    const JoinSplitFluidContract = await JoinSplitFluid.deployed();
    await ACEContract.setCommonReferenceString(bn128.CRS);
    await ACEContract.setProof(MINT_PROOF, JoinSplitFluidContract.address);
    await ACEContract.setProof(SWAP_PROOF, Swap.address);
    await ACEContract.setProof(DIVIDEND_PROOF, Dividend.address);
    await ACEContract.setProof(JOIN_SPLIT_PROOF, JoinSplit.address);
    await ACEContract.setProof(PRIVATE_RANGE_PROOF, PrivateRange.address);
  }
};
