import aztec from 'aztec.js';
import AuthService from '../../helpers/AuthService';
import {
  decryptMessage,
} from '../../utils/crypto';

export default async function decryptNoteValue({
  encryptedViewingKey,
}) {
  if (!encryptedViewingKey) {
    return 0;
  }

  const privateKey = await AuthService.getPrivateKey();
  const viewingKey = await decryptMessage(privateKey, encryptedViewingKey);
  const note = await aztec.note.fromViewKey(viewingKey);
  const {
    k,
  } = note || {}

  return (k && k.toNumber()) || 0;
}
