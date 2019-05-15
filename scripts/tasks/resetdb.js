/* eslint-disable newline-per-chained-call */
import graphConfig from '../../config/graph';
import getNetwork from '../utils/getNetwork';
import instance from '../utils/instance';
import {
  log,
  successLog,
  errorLog,
} from '../utils/log';

export default function resetdb({
  onError,
  onClose,
} = {}) {
  const network = getNetwork();
  const {
    name,
    user,
  } = graphConfig.databases[network] || {};
  let containerId;

  return instance(
    'docker ps -aqf "name=graph-node"',
    {
      onError,
    },
  ).next((data) => {
    const graphNodeContainerId = data.replace('\n', '');
    return instance(
      `docker stop ${graphNodeContainerId}`,
      {
        onError,
      },
    );
  }).next(() => { // eslint-disable-line arrow-body-style
    return instance(
      'docker ps -aqf "name=postgres"',
      {
        onError,
      },
    );
  }).next((data) => {
    containerId = data.replace('\n', '');
    if (!containerId) {
      log('No postgres docker container.');
      if (onClose) {
        onClose();
      }
      return;
    }

    return instance(
      `docker exec ${containerId} dropdb -U ${user} ${name}`,
    );
  }).next((data, error) => {
    if (!error) {
      successLog(data);
    } else if (error.includes('does not exist')) {
      log(`No database named ${name}.`);
    } else {
      errorLog('error', error);

      if (onClose) {
        onClose();
      }

      return;
    }

    return instance(
      `docker exec ${containerId} createdb -U ${user} ${name}`,
    );
  }).next((data, error) => {
    if (error) {
      errorLog(`Cannot create db '${name}'.`, error);
      return;
    }
    successLog(`Successfully created new database '${name}'.`);

    if (onClose) {
      onClose();
    }
  });
}
