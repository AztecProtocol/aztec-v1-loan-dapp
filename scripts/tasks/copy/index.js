import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import {
  root,
} from '../../utils/path';
import {
  ensureDirectory,
  isDirectory,
  isFile,
  copyFile,
  copyFolder,
} from '../../utils/fs';
import {
  logEntries,
  errorLog,
  warnLog,
  successLog,
} from '../../utils/log';
import graphConfig from '../../../config/graph';
import copyConfigForClient from './copyConfigForClient';

const contractsDest = './build/contracts';
const abiFilesDest = './build/abis';
const graphConfigPath = path.join(root, graphConfig.manifest);

const clientContractsDest = path.join(root, './client/src/contracts');


const getSubgraphConfig = () => {
  let config = null;
  if (isFile(graphConfigPath)) {
    try {
      config = yaml.safeLoad(fs.readFileSync(graphConfigPath, 'utf8'));
    } catch (error) {
      errorLog(error);
    }
  }

  return config;
};

const retrieveSubgraphAbis = dataSources =>
  dataSources.reduce((arr, cur) => [
    ...arr,
    ...((cur.mapping && cur.mapping.abis) || []),
    ...((cur.templates && retrieveSubgraphAbis(cur.templates)) || []),
  ], []);

const copyAbiForTheGraph = (contractName, destPath) =>
  new Promise((resolve, reject) => {
    let abi;
    const srcPath = path.join(root, `${contractsDest}/${contractName}.json`);
    try {
      const contract = require(path.relative(__dirname, srcPath)); // eslint-disable-line
      ({ abi } = contract || {});
    } catch (error) {
      errorLog(`Cannot require contract from ${srcPath}`);
      reject();
    }
    if (!abi) {
      errorLog(`Abi is not defined in contract ${contractName}`);
      reject();
      return;
    }

    fs.writeFile(destPath, JSON.stringify(abi), (error) => {
      if (error) {
        errorLog('Failed to create abi file', `${destPath}\n`, error);
      }
      resolve({
        src: path.relative(root, srcPath),
        dest: path.relative(root, destPath),
        error,
      });
    });
  });

const copyContractAddressesForTheGraph = prevAddresses =>
  new Promise((resolve) => {
    const originalConfig = fs.readFileSync(graphConfigPath, 'utf8');
    let newConfig = originalConfig;
    prevAddresses.forEach(({
      name,
      address,
    }) => {
      const contract = require(path.relative( // eslint-disable-line
        __dirname,
        `${contractsDest}/${name}.json`,
      ));
      const {
        networks,
      } = contract || {};
      if (!networks) {
        errorLog(`No networks defined for contract ${name}`);
        return;
      }
      const networkConfigs = Object.values(networks);
      const {
        address: newAddress,
      } = networkConfigs[networkConfigs.length - 1] || {};
      if (!newAddress) {
        errorLog(`No address defined for contract ${name}`);
        return;
      }
      const pattern = new RegExp(`(address:)(\\s)+'(${address})'`);
      newConfig = newConfig.replace(pattern, `$1 '${newAddress}'`);
    });

    fs.writeFile(graphConfigPath, newConfig, (error) => {
      if (error) {
        errorLog(`Cannot white to file ${graphConfigPath}`);
      }
      resolve({
        src: `Contract address${prevAddresses.length === 1 ? '' : 'es'}`,
        dest: graphConfigPath,
        error,
      });
    });
  });

const copyContracts = ({
  from = contractsDest,
  to,
}) => {
  const src = path.join(root, from);
  const isSrcFile = isFile(src);
  const destFolder = to.split('/');
  if (isSrcFile) {
    destFolder.pop();
  }
  destFolder.forEach((folderPath, i) => {
    ensureDirectory(path.join(root, destFolder.slice(0, i + 1).join('/')));
  });

  if (isSrcFile) {
    return copyFile(src, to);
  }

  return copyFolder(src, to);
};

export default async function copy({
  onError,
  onClose,
} = {}) {
  if (!isDirectory(path.join(root, './build'))) {
    errorLog('Please run `yarn build` to compile contracts first.');
    if (onError) {
      onError();
    }
    return;
  }

  const promises = [];

  promises.push(copyContracts({
    to: clientContractsDest,
  }));

  const subgraphConfig = getSubgraphConfig();
  if (!subgraphConfig) {
    warnLog('Cannot find graph/subgraph.yaml');
  } else {
    const {
      dataSources,
    } = subgraphConfig;

    if (!dataSources) {
      errorLog('There is no dataSources defined in subgraph.yaml');
    } else {
      promises.push(copyConfigForClient());

      const addresses = [];
      dataSources.forEach((dataSource) => {
        const {
          name,
          source: {
            address,
          } = {},
        } = dataSource;
        if (!name) {
          errorLog('Source name is not defined.');
          return;
        }
        if (!address) {
          errorLog('Contract address is not defined');
          return;
        }
        addresses.push({
          name,
          address,
        });
      });
      if (addresses.length) {
        promises.push(copyContractAddressesForTheGraph(addresses));
      }

      const abis = retrieveSubgraphAbis(dataSources);
      if (abis.length) {
        ensureDirectory(abiFilesDest);

        abis.forEach(({
          name,
          file,
        }) => {
          promises.push(copyAbiForTheGraph(
            name,
            file,
          ));
        });
      }
    }
  }

  const result = await Promise.all(promises);
  const copiedMessages = [];
  let successCopies = 0;
  result.forEach(({
    error,
    src,
    dest,
  }) => {
    if (error) {
      copiedMessages.push(`${chalk.red('✖')} ${path.relative(root, src)} ➔  ${path.relative(root, dest)}`);
    } else {
      successCopies += 1;
      copiedMessages.push(`  ${path.relative(root, src)} ➔  ${path.relative(root, dest)}`);
    }
  });

  logEntries(copiedMessages);
  successLog(`${successCopies} files/folders copied.`);

  if (onClose) {
    onClose();
  }
}
