const LoanPayment = artifacts.require('./LoanPayment.sol');
const ZKERC20 = artifacts.require('./ZKERC20.sol');

module.exports = async (deployer) => {
  const zkerc20Contract = await ZKERC20.deployed();
  await deployer.deploy(
    LoanPayment,
    zkerc20Contract.address,
  );
};
