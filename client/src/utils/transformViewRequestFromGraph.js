export default function transformViewRequestFromGraph({
  id,
  lender: {
    address: lenderAddress,
  } = {},
  lenderPublicKey,
  sharedSecret,
}) {
  return {
    id,
    lenderAddress,
    lenderPublicKey,
    sharedSecret,
  };
}
