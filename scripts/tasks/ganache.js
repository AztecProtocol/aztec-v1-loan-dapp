import ganacheInstance from '../lib/ganacheInstance';

export default function ganache({
  onError,
  onClose,
} = {}) {
  return ganacheInstance({
    onError,
    onClose,
  });
}
