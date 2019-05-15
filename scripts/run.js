import {
  log,
  successLog,
  warnLog,
  errorLog,
} from './utils/log';
import taskPromise from './utils/taskPromise';

function run(fn, options) {
  const task = (typeof fn.default === 'undefined') ? fn : fn.default;
  successLog(`Start running '${task.name}${options.length ? ` ${options.join(' ')}` : ''}'...`);
  const startTime = Date.now();

  return taskPromise(task)
    .then((triggerClose) => {
      const diff = Date.now() - startTime;
      successLog(`\nFinished '${task.name}' in ${diff} ms`);

      if (triggerClose === true) {
        process.exit(0);
      }
    })
    .catch((error) => {
      if (error) {
        log(error);
      }

      warnLog(`\nFailed to run '${task.name}${options.length ? ` ${options.join(' ')}` : ''}'.`);
    });
}

if (process.argv.length > 2) {
  delete require.cache[__filename]; // eslint-disable-line no-underscore-dangle

  const taskName = process.argv[2];
  const module = require(`./tasks/${taskName}`).default; // eslint-disable-line
  run(module, process.argv.slice(3)).catch(err => errorLog(err.stack));
}
