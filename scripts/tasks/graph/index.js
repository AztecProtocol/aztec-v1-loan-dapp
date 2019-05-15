import {
  args,
} from '../../utils/cmd';
import {
  errorLog,
} from '../../utils/log';
import codegen from './codegen';
import create from './create';
import deploy from './deploy';
import start from './start';

const commandMapping = {
  codegen,
  create,
  deploy,
  start,
};

export default function graph({
  onError,
  onClose,
} = {}) {
  const command = args(0);

  if (!commandMapping[command]) {
    const available = Object.keys(commandMapping);
    errorLog(`Command '${command}' is not valid. Available commands: [${available.join(', ')}]`);

    if (onClose) {
      onClose();
    }
    return;
  }

  return commandMapping[command]({
    onError,
    onClose,
  });
}
