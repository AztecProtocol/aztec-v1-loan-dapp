import aztec from 'aztec.js';
import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';
import CurrencyService from '../../helpers/CurrencyService';
import {
  valueOf,
  restoreFromSharedSecret,
  approveNoteAccess,
  mintNote,
  signNote,
} from '../../utils/note';

export default async function payInterest({
  loanAddress,
  amount,
  currencyId,
  balanceSharedSecret,
  lender,
}) {
  if (amount <= 0
    || !balanceSharedSecret
    || !loanAddress
  ) {
    return 0;
  }

  const currentAddress = AuthService.address;
  const publicKey = await AuthService.getPublicKey();

  const balanceNote = await restoreFromSharedSecret(balanceSharedSecret);
  balanceNote.owner = loanAddress;
  const balanceValue = valueOf(balanceNote);

  const newBalanceValue = balanceValue + amount;
  const newBalanceNote = await aztec.note.create(publicKey, newBalanceValue, loanAddress);
  const withdrawNote = await aztec.note.create(publicKey, 0);

  const currencyContractAddress = CurrencyService.getZKAddress(currencyId);
  const interestNote = await mintNote({
    amount,
    currencyContractAddress,
  });

  const {
    noteHash,
  } = interestNote.exportNote();

  const signature = await signNote({
    validatorAddress: currencyContractAddress,
    noteHash,
    spender: loanAddress,
  });

  await Web3Service.useContract('ZKERC20')
    .at(currencyContractAddress)
    .method('confidentialApprove')
    .send(
      noteHash,
      loanAddress,
      true,
      signature,
    );

  const {
    proofData,
  } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
    inputNotes: [balanceNote, interestNote],
    outputNotes: [withdrawNote, newBalanceNote],
    inputNoteOwners: [],
    senderAddress: loanAddress,
    publicOwner: currentAddress,
    kPublic: 0,
  });

  await Web3Service.useContract('Loan')
    .at(loanAddress)
    .method('adjustInterestBalance')
    .send(
      proofData,
    );

  await approveNoteAccess({
    note: newBalanceNote,
    shareWith: lender,
  });

  return amount;
}
