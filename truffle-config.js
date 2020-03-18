require('@babel/register');

module.exports = {
  compilers: {
    solc: {
      version: '0.5.16',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1,
        },
        evmVersion: 'petersburg',
      },
    },
  },
  networks: {
    development: {
      host: '127.0.0.1',
      network_id: '*',
      port: 8545,
    },
    test: {
      host: '127.0.0.1',
      network_id: '*',
      port: 8544,
    },
  },
};
