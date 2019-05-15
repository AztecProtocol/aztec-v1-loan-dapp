import instance from '../utils/instance';

export default function migrate({
  onError,
  onClose,
} = {}) {
  return instance(
    'truffle',
    [
      'migrate',
      '--reset',
    ],
    {
      onError,
      onClose,
    },
  );
}
