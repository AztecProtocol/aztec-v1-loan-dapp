import codegen from './codegen';
import create from './create';
import deploy from './deploy';
import pipeTasks from '../../utils/pipeTasks';

export default function start({
  onError,
  onClose,
} = {}) {
  return pipeTasks(
    [
      codegen,
      create,
      deploy,
    ],
    {
      onError,
      onClose,
    },
  );
}
