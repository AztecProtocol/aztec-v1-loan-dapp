import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';
import PrivateKey from './PrivateKey';

const RestoreSuccess = ({
  currentAccount: {
    privateKey,
  },
}) => (
  <Block padding="l 0">
    <Block bottom="l">
      <Text
        text="Account Restored!"
        size="m"
      />
    </Block>
    <Block padding="l">
      <PrivateKey
        privateKey={privateKey}
      />
    </Block>
  </Block>
);

RestoreSuccess.propTypes = {
  currentAccount: PropTypes.shape({
    privateKey: PropTypes.string.isRequired,
  }).isRequired,
};

export default RestoreSuccess;
