/* global artifacts */
const {
  constants: { ERC20_SCALING_FACTOR },
} = require('@aztec/dev-utils');
const { isUndefined } = require('lodash');

const ACE = artifacts.require('./ACE.sol');
const AdjustableFactory = artifacts.require('FactoryAdjustable201907.sol');

module.exports = (deployer) => {
  if (isUndefined(ACE) || isUndefined(ACE.address)) {
      console.log('Please deploy the ACE contract first');
  }

  /* eslint-disable no-new */
  new Promise(() => {
      return deployer.deploy(AdjustableFactory, ACE.address).then(async ({ address }) => {
          const ace = await ACE.at(ACE.address);

          await ace.setFactory(1 * 256 ** 2 + 1 * 256 ** 1 + 2 * 256 ** 0, address);
      });
  });
}
