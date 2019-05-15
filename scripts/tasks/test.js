import killPort from 'kill-port';
import {
  log,
  successLog,
} from '../utils/log';
import ganacheInstance from '../lib/ganacheInstance';
import testInstance from '../lib/testInstance';

export default function test({
  onError,
  onClose,
} = {}) {
  let ganacheCp;
  let ganachePort;

  const handleCloseGanache = async () => {
    if (!ganacheCp) return;
    ganacheCp = null;

    if (ganachePort) {
      await killPort(ganachePort);
      ganachePort = null;
    }

    successLog('Ganache instance cleared.');
  };

  const handleFinishTest = async () => {
    if (ganacheCp) {
      log('Stopping ganache...');
      ganacheCp.kill();
      await handleCloseGanache();
    }
    if (onClose) {
      onClose();
    } else {
      setTimeout(() => {
        process.exit(0);
      }, 100);
    }
  };

  const onStartGanache = (port) => {
    ganachePort = port;

    testInstance({
      onClose: handleFinishTest,
    });
  };

  ganacheCp = ganacheInstance({
    onStart: onStartGanache,
    onClose: handleCloseGanache,
    onError,
  });

  return ganacheCp;
}
