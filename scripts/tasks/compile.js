import instance from '../utils/instance';

export default function compile({
  onError,
  onClose,
} = {}) {
  return instance(
    'truffle',
    [
      'compile',
      '--all',
    ],
    {
      onError,
      onClose,
    },
  );
}
