import isSameAddress from './isSameAddress';

export default function transformNoteFromGraph(
  {
    access,
    ...note
  },
  currentAddress,
) {
  const userAccess = access
    && access.find(({ user }) => isSameAddress(user.address, currentAddress));

  return {
    ...userAccess,
    ...note,
  };
}
