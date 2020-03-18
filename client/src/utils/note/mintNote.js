import { JoinSplitProof, note } from 'aztec.js';
import Web3Service from '../../helpers/Web3Service';
import AuthService from '../../helpers/AuthService';

export default async function mintNote({
  amount,
  currencyContractAddress,
}) {
  const currentAddress = AuthService.address;
  const publicKey = await AuthService.getPublicKey();

  const settlementNote = await note.create(publicKey, amount);
  const joinSplitContract = Web3Service.contract('JoinSplit');
  const proof = new JoinSplitProof(
    [],
    [settlementNote],
    currentAddress,
    -amount,
    currentAddress,
  );

  const proofData = proof.encodeABI(joinSplitContract);
  const signatures = proof.constructSignatures();

  const hashProof = proof.hash;

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
