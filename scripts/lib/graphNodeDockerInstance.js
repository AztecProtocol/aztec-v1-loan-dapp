import instance from '../utils/instance';
import {
  log,
} from '../utils/log';

export default function graphNodeDockerInstance({
  onClose,
  onError,
}) {
  const handleReceiveOutput = (output) => {
    if (!output.includes('TokioContention')) {
      process.stdout.write(output);
    }
  };

  const handleClearContainers = () => {
    instance('docker ps -aqf "name=graph-node"')
      .next((data) => {
        const graphNodeContainerId = data.replace('\n', '');
        if (!graphNodeContainerId) {
          return;
        }

        return instance(
          `docker stop ${graphNodeContainerId}`,
        );
      })
      .next(() => {
        log('graph-node docker container stopped.');
        onClose();
      });
  };

  return instance(
    'cd graph && docker-compose up',
    {
      shouldStart: output => output.includes('Starting GraphQL WebSocket server at'),
      onReceiveOutput: handleReceiveOutput,
      handleClear: handleClearContainers,
      onError,
      onClose,
    },
  );
}
