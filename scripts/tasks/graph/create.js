import graphConfig from '../../../config/graph';
import {
  errorLog,
} from '../../utils/log';
import instance from '../../utils/instance';
import getNetwork from '../../utils/getNetwork';
import {
  getProjectName,
  onReceiveErrorOutput,
} from '../../utils/graph';

export default function create({
  onError,
  onClose,
}) {
  const network = getNetwork();

  const {
    node,
  } = graphConfig.networks[network] || {};
  if (!node) {
    errorLog(`Node url is not defined for network '${network}'`);

    if (onClose) {
      onClose();
    }

    return;
  }

  const projectName = getProjectName();

  return instance(
    `graph create ${projectName} --node ${node}`,
    {
      onReceiveErrorOutput,
      onError,
      onClose,
    },
  );
}
