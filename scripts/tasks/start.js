import {
  terminal,
} from 'terminal-kit';
import chalk from 'chalk';
import detectPort from 'detect-port';
import ganacheInstance from '../lib/ganacheInstance';
import graphNodeDockerInstance from '../lib/graphNodeDockerInstance';
import {
  log,
  successLog,
  warnLog,
  errorLog,
} from '../utils/log';
import taskPromise from '../utils/taskPromise';
import pipeTasks from '../utils/pipeTasks';
import compile from './compile';
import migrate from './migrate';
import copy from './copy';
import graph from './graph/start';
import resetdb from './resetdb';

const clientPort = 3000;

export default function start({
  onError,
  onClose,
} = {}) {
  const runningProcesses = {};
  let confirmClose;

  const doClose = () => {
    if (onClose) {
      onClose(true);
    } else {
      setTimeout(() => {
        process.exit(0);
      }, 100);
    }
  };

  const handleClose = async () => {
    terminal.grabInput(false);
    Object.keys(runningProcesses)
      .forEach((name) => {
        const cp = runningProcesses[name];
        if (!cp) return;

        log(`Stopping ${name}...`);
        runningProcesses[name] = null;
        if (typeof cp.clear === 'function') {
          cp.clear();
        } else {
          cp.kill();
        }
      });
  };

  const makeCloseChildProcessCallback = name =>
    () => {
      if (!(name in runningProcesses)) return;

      delete runningProcesses[name];
      successLog(`${name} instance stopped.`);

      if (Object.keys(runningProcesses).length) {
        handleClose();
      } else {
        doClose();
      }
    };

  terminal.grabInput(true);
  terminal.on('key', (key) => {
    switch (key) {
      case 'CTRL_C': {
        if (!confirmClose) {
          confirmClose = true;
          warnLog('\nGracefully stopping child processes...\n');
          log('Press ctrl+c again to force exit.');
          log("(This may cause some problems when running 'yarn start' again.)\n");
          handleClose();
        } else {
          process.exit(0);
        }
        break;
      }
      default:
        if (confirmClose) {
          confirmClose = false;
        }
    }
  });

  const handleError = onError
    || (() => {
      if (onClose) {
        onClose();
      }
    });

  const handleBuildError = () => {
    log('');
    warnLog('Something went wrong');
    log('');
    log(`Please fix the above error and then run ${chalk.cyan('yarn build')} in another terminal window.`);
    log(`Or run ${chalk.cyan('yarn graph start')} if the error is caused by the graph.`);
    log('');
  };

  const handleFinishBuild = () => {
    detectPort(clientPort, (error, port) => {
      if (error) {
        errorLog(error);
      } else if (port === clientPort) {
        log(`\nRun ${chalk.yellow.bold('yarn client')} in another terminal window to start the react app.\n`);
      } else {
        log(`\nYou can now view client in the browser: ${chalk.cyan(`http://localhost:${clientPort}/`)}\n`);
      }
    });
  };

  const doCloseDocker = makeCloseChildProcessCallback('docker');

  runningProcesses.ganache = ganacheInstance({
    onClose: makeCloseChildProcessCallback('ganache'),
    onError: handleError,
  }).next(async () => {
    log('Recreating database...');
    try {
      await taskPromise(resetdb);
    } catch (error) {
      handleClose();
      return;
    }

    runningProcesses.docker = graphNodeDockerInstance({
      onClose: (code) => {
        if (code === null) return;
        doCloseDocker();
      },
      onError: handleError,
    });

    return runningProcesses.docker;
  }).next(() => {
    pipeTasks(
      [
        compile,
        migrate,
        copy,
        graph,
      ],
      {
        onClose: handleFinishBuild,
        onError: handleBuildError,
      },
    );
  });

  return runningProcesses;
}
