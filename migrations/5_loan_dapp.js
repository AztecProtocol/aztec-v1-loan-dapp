/* global artifacts */
/* eslint-disable no-await-in-loop */
const settlementCurrencies = require('../config/settlementCurrencies').default;

const SettlementToken = artifacts.require('./SettlementToken.sol');
const ZKERC20 = artifacts.require('./ZKERC20/ZKERC20.sol');
const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const LoanDapp = artifacts.require('./LoanDapp.sol');
const LoanUtilities = artifacts.require('./LoanUtilities.sol');

module.exports = async (deployer, network) => {
  let aceContract;

  if (network === 'development' || network === 'test') {
    aceContract = await ACE.deployed();
  }

  await deployer.deploy(LoanUtilities);
  await deployer.link(LoanUtilities, LoanDapp);
  await deployer.deploy(LoanDapp, aceContract.address);

  const loanDappContract = await LoanDapp.deployed();
  for (let i = 0; i < settlementCurrencies.length; i += 1) {
    let settlementContractAddress;
    if (network === 'development' || network === 'test') {
      const settlementContract = await deployer.deploy(SettlementToken);
      settlementContractAddress = settlementContract.address;
    } else {
      ({
        address: settlementContractAddress,
      } = settlementCurrencies[i].networks[network]);
    }

    const zkerc20Contract = await deployer.deploy(
      ZKERC20,
      aceContract.address,
      settlementContractAddress,
    );

    await loanDappContract.addSettlementCurrency(
      i,
      zkerc20Contract.address,
    );
  }
};
