import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';
import PrivateKey from './PrivateKey';
import SeedPhrase from './SeedPhrase';

const CreateSuccess = ({
  currentAccount: {
    seedPhrase,
    privateKey,
  },
}) => {
  return (
    <Block padding="l 0">
      <Block bottom="l">
        <Text
          text="Account Created!"
          size="m"
        />
      </Block>
      <Block padding="l">
        <PrivateKey
          privateKey={privateKey}
        />
        {process.env.NODE_ENV !== 'production' && (
          <Block padding="m 0">
            <Text size="xs">
              You can put this private key in a .env file as
              <Block padding="s 0">
                <Text
                  className="break-word"
                  text={`GANACHE_TESTING_ACCOUNT_0=${privateKey}`}
                  size="xxs"
                  weight="semibold"
                />
              </Block>
              The next time you start ganache,
              an account will be created with this private key and an initial balance of 100 eth.
              You can also define custom balance like this:
              <Block top="s">
                <Text
                  text="GANACHE_TESTING_ACCOUNT_0_BALANCE=10000"
                  size="xxs"
                  weight="semibold"
                />
              </Block>
            </Text>
          </Block>
        )}
      </Block>
      <Block padding="l">
        <SeedPhrase
          seedPhrase={seedPhrase}
        />
      </Block>
    </Block>
  );
};

CreateSuccess.propTypes = {
  currentAccount: PropTypes.shape({
    seedPhrase: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired,
  }).isRequired,
};

export default CreateSuccess;
