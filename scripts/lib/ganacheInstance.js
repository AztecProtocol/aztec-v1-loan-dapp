import Web3 from 'web3';
import killPort from 'kill-port';
import truffleConfig from '../../truffle-config';
import ganacheConfig from '../../config/ganache';
import '../envConfig';
import instance from '../utils/instance';
import getNetwork from '../utils/getNetwork';
import {
  warnLog,
  log,
} from '../utils/log';
import {
  argv,
} from '../utils/cmd';

let web3;

const network = getNetwork();

const defaultPort = 8545;
const defaultNumberOfAccounts = 10;

export const getPort = () => {
  let port = argv('port');
  if (!port) {
    ({
      port,
    } = (truffleConfig.networks || {})[network] || {});
  }

  return port;
};

const getNetworkId = () => {
  let networkId = argv('networkId');
  if (!networkId) {
    ({
      network_id: networkId,
    } = (truffleConfig.networks || {})[network] || {});
  }

  return networkId;
};

export const getHost = () => {
  const {
    host = 'localhost',
  } = (truffleConfig.networks || {})[network] || {};

  return `http://${host}`;
};

const generateAccounts = () => {
  const accounts = [];
  const {
    numberOfAccounts = defaultNumberOfAccounts,
    defaultBalanceEther = 0,
  } = (ganacheConfig.networks || {})[network] || {};

  for (let i = 0; i < numberOfAccounts; i += 1) {
    let address;
    let privateKey = process.env[`GANACHE_TESTING_ACCOUNT_${i}`];
    if (privateKey) {
      ({ address } = web3.eth.accounts.privateKeyToAccount(privateKey));
    } else {
      ({
        address,
        privateKey,
      } = web3.eth.accounts.create());
    }
    const balance = web3.utils.toWei(
      `${process.env[`GANACHE_TESTING_ACCOUNT_${i}_BALANCE`] || defaultBalanceEther}`,
      'ether',
    );

    accounts.push({
      address,
      privateKey,
      balance,
    });
  }
  return accounts;
};

export default function ganacheInstance({
  onStart,
  onReceiveOutput,
  onReceiveErrorOutput,
  onError,
  onClose,
  verbose = false,
} = {}) {
  let port = getPort();
  if (!port) {
    warnLog(`Port is not defined for network '${network}'. Using default port number ${defaultPort}`);
    port = defaultPort;
  }

  const host = getHost();
  const provider = new Web3.providers.HttpProvider(`${host}:${port}`);
  web3 = new Web3(provider);

  const params = argv();
  const accounts = generateAccounts();
  accounts.forEach(({
    privateKey,
    balance,
  }) => {
    params.push(`--account=${privateKey},${balance}`);
  });
  const networkId = getNetworkId();
  if (networkId.match(/^[1-9]+$/)) {
    params.push('-i');
    params.push(`${networkId}`);
  }

  let lastMethod;
  const handleReceiveOutput = (output) => {
    if (!verbose && output.match(/^(\s){0,}[a-z]+_(.|\s)+$/)) {
      lastMethod = output;
    } else {
      if (onReceiveOutput) {
        if (lastMethod) {
          onReceiveOutput(lastMethod);
        }
        onReceiveOutput(output);
      } else {
        if (lastMethod) {
          process.stdout.write(lastMethod);
        }
        process.stdout.write(output);
      }
      lastMethod = '';
    }
  };

  const handleClear = async () => {
    await killPort(port);
    log(`Clear process running on port ${port}`);
  };

  return instance(
    'ganache-cli',
    [
      '-p',
      port,
      ...params,
    ],
    {
      shouldStart: output => output.includes('Listening on')
        && `Ganache is listening on ${host}:${port}\n`,
      onStart: () => {
        if (onStart) {
          onStart(port);
        }
        return port;
      },
      handleClear,
      onReceiveOutput: handleReceiveOutput,
      onReceiveErrorOutput,
      onError,
      onClose,
      windowsVerbatimArguments: true,
    },
  );
}
