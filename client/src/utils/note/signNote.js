import aztec from 'aztec.js';
import utils from '@aztec/dev-utils';
import AuthService from '../../helpers/AuthService';

export default async function signNote({
  validatorAddress,
  noteHash,
  spender,
}) {
  if (!validatorAddress
    || !noteHash
    || !spender
  ) {
    return '';
  }

  const privateKey = await AuthService.getPrivateKey();

  const domain = aztec.signer.generateZKAssetDomainParams(validatorAddress);
  const schema = utils.constants.eip712.NOTE_SIGNATURE;
  const status = true;
  const message = {
    noteHash,
    spender,
    status,
  };
  const { signature } = aztec.signer.signTypedData(domain, schema, message, privateKey);

  return signature[0] + signature[1].slice(2) + signature[2].slice(2);
};
