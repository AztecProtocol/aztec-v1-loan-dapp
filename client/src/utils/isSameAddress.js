export default function isSameAddress(address1, address2) {
  return !!address1
    && !!address2
    && address1.toLowerCase() === address2.toLowerCase();
}
