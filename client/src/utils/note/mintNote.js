import aztec from 'aztec.js';
import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';

export default async function mintNote({
  amount,
  currencyContractAddress,
}) {
  const currentAddress = AuthService.address;
  const publicKey = await AuthService.getPublicKey();

  const settlementNote = await aztec.note.create(publicKey, amount);
  const joinSplitContract = Web3Service.contract('JoinSplit');
  const {
    proofData,
    expectedOutput,
    signatures,
  } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
    inputNotes: [],
    outputNotes: [settlementNote],
    senderAddress: currentAddress,
    inputNoteOwners: [],
    publicOwner: currentAddress,
    kPublic: -amount,
    validatorAddress: joinSplitContract.address,
  });

  const proofOutput = aztec.abiEncoder.outputCoder.getProofOutput(expectedOutput, 0);
  const hashProof = aztec.abiEncoder.outputCoder.hashProofOutput(proofOutput);

  await Web3Service.useContract('ACE')
    .method('publicApprove')
    .send(
      currencyContractAddress,
      hashProof,
      amount,
    );

  await Web3Service.useContract('ZKERC20')
    .at(currencyContractAddress)
    .method('confidentialTransfer')
    .send(
      proofData,
      signatures,
    );

  return settlementNote;
}
