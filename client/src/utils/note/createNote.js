import aztec from 'aztec.js';
import AuthService from '../../helpers/AuthService';

export default async function createNote(value, publicKey = '', noteOwner = '') {
  if (!publicKey) {
    publicKey = await AuthService.getPublicKey();
  }

  const note = await aztec.note.create(
    publicKey,
    value,
    noteOwner,
  );

  return note;
}
