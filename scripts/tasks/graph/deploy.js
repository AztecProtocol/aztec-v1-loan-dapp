import graphConfig from '../../../config/graph';
import {
  errorLog,
} from '../../utils/log';
import instance from '../../utils/instance';
import getNetwork from '../../utils/getNetwork';
import {
  getProjectName,
  getManifest,
  onReceiveErrorOutput,
} from '../../utils/graph';

export default function deploy({
  onError,
  onClose,
}) {
  const network = getNetwork();
  const {
    ipfs,
    node,
  } = graphConfig.networks[network] || {};
  if (!node || !ipfs) {
    if (!node) {
      errorLog(`node url is not defined for network '${network}'`);
    }
    if (!ipfs) {
      errorLog(`ipfs url is not defined for network '${network}'`);
    }

    if (onClose) {
      onClose();
    }

    return;
  }

  const handleReceiveOutput = (output) => {
    if (output.includes('✖ Failed to')) {
      errorLog(output);
      if (onError) {
        onError();
      }
    } else {
      onReceiveErrorOutput(output);
    }
  };

  const projectName = getProjectName();
  const manifestPath = getManifest();

  return instance(
    `graph deploy ${projectName} ${manifestPath} --debug --ipfs ${ipfs} --node ${node}`,
    {
      onReceiveErrorOutput: handleReceiveOutput,
      onError,
      onClose,
    },
  );
}
