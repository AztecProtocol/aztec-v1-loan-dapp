import taskPromise from './taskPromise';
import asyncForEach from './asyncForEach';

export default async function pipeTasks(
  tasks,
  {
    onError,
    onClose,
  } = {},
) {
  await asyncForEach(tasks, async (task, i) => {
    await taskPromise(tasks[i])
      .catch((error) => {
        onError(error);
      });
  });

  if (onClose) {
    onClose();
  }
}
