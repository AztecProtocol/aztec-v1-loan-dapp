export default function getShortenAddress(address, prefixLen = 6, suffixLen = 4) {
  const prefix = address.slice(0, prefixLen);
  const suffix = address.slice(-suffixLen);
  return `${prefix}...${suffix}`;
}
