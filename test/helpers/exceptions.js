/* global assert */
const PREFIX = 'Returned error: VM Exception while processing transaction: ';

async function tryCatch(promise, message) {
  try {
    await promise;
    throw null; // eslint-disable-line no-throw-literal
  } catch (error) {
    assert(error, 'Expected an error but did not get one');
    assert(
      error.message.startsWith(`${PREFIX}${message}`),
      `Expected an error starting with "${PREFIX}${message}" but got "${error.message}" instead`,
    );
  }
}

const makeTryCatch = message => async promise => tryCatch(promise, message);

export const assertRevert = makeTryCatch('revert');
export const assertOutOfGas = makeTryCatch('out of gas');
export const assertInvalidJump = makeTryCatch('invalid JUMP');
export const assertInvalidOpcode = makeTryCatch('invalid opcode');
export const assertStackOverflow = makeTryCatch('stack overflow');
export const assertStackUnderflow = makeTryCatch('stack underflow');
export const assertStaticStateChange = makeTryCatch('static state change');
