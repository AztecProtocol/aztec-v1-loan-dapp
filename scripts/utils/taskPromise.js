import isPromise from './isPromise';

export default function taskPromise(task) {
  if (isPromise(task)) {
    return task;
  }

  return new Promise((resolve, reject) => {
    task({
      onClose: resolve,
      onError: reject,
    });
  });
}
