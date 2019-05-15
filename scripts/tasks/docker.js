import {
  terminal,
} from 'terminal-kit';
import graphNodeDockerInstance from '../lib/graphNodeDockerInstance';
import {
  log,
} from '../utils/log';

export default function docker({
  onError,
  onClose,
} = {}) {
  let dockerCp;

  const doClose = () => {
    if (onClose) {
      onClose(true);
    } else {
      setTimeout(() => {
        process.exit(0);
      }, 100);
    }
  };

  terminal.grabInput(true);
  terminal.on('key', (key) => {
    switch (key) {
      case 'CTRL_C': {
        log('Stopping docker...');
        dockerCp.clear();
        break;
      }
      default:
    }
  });

  dockerCp = graphNodeDockerInstance({
    onError,
    onClose: doClose,
  });

  return dockerCp;
}
