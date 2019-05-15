import instance from '../utils/instance';
import {
  args,
  argv,
} from '../utils/cmd';
import {
  isFile,
} from '../utils/fs';
import {
  errorLog,
} from '../utils/log';

export default function testInstance({
  onClose,
  onError,
}) {
  const params = [
    'test',
  ];

  const filename = args(0);
  if (filename && filename.endsWith('.js')) {
    const filePath = filename.startsWith('./test')
      ? filename
      : `./test/${filename}`.replace(/\/{2,}/g, '/');

    if (!isFile(filePath)) {
      errorLog(`Can't find test file '${filename}' in ./test`);
      if (onClose) {
        onClose();
      }
      return;
    }
    params.push(filePath);
  }

  params.push('--network');
  params.push('test');

  if (argv('compile-all')) {
    params.push('--compile-all');
  }
  if (argv('verbose') || argv('verbose-rpc')) {
    params.push('--verbose-rpc');
  }
  if (argv('show-events')) {
    params.push('--show-events');
  }

  return instance(
    'truffle',
    params,
    {
      onClose,
      onError,
    },
  );
}
