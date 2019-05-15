import AuthService from '../../helpers/AuthService';
import Web3Service from '../../helpers/Web3Service';
import {
  encryptMessage,
} from '../../utils/crypto';

export default async function approveNoteAccess({
  note,
  shareWith = null,
}) {
  const publicKey = await AuthService.getPublicKey();
  const {
    noteHash,
    viewingKey,
  } = note.exportNote();

  const encryptedViewingKey = await encryptMessage(publicKey, viewingKey);
  const sharedSecret = shareWith
    ? await encryptMessage(shareWith.publicKey, viewingKey)
    : '';

  await Web3Service.useContract('LoanPayment')
    .method('approveNoteAccess')
    .send(
      noteHash,
      encryptedViewingKey,
      sharedSecret,
      shareWith ? shareWith.address : AuthService.address,
    );

  return note;
}
