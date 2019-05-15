import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';

const PrivateKey = ({
  privateKey,
}) => (
  <div>
    <Block padding="m 0">
      <Text
        text="Private Key:"
        size="s"
        weight="bold"
      />
    </Block>
    <Block padding="m 0">
      <Block
        padding="m"
        background="grey-lightest"
        borderRadius="default"
      >
        <Text
          className="break-word"
          text={privateKey}
        />
      </Block>
    </Block>
  </div>
);

PrivateKey.defaultProps = {
  privateKey: PropTypes.string.isRequired,
};

export default PrivateKey;
