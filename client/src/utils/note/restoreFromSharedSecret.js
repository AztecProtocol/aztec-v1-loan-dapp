import aztec from 'aztec.js';
import AuthService from '../../helpers/AuthService';
import {
  decryptMessage,
} from '../../utils/crypto';

export default async function restoreFromSharedSecret(sharedSecret) {
  const privateKey = await AuthService.getPrivateKey();
  const viewingKey = await decryptMessage(privateKey, sharedSecret);
  
  return aztec.note.fromViewKey(viewingKey);
}
