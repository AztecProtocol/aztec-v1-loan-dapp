import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  TextButton,
} from '@aztec/guacamole-ui';

const SeedPhrase = ({
  seedPhrase,
}) => {
  const downloadLink = `data:application/octet-stream,${encodeURIComponent(seedPhrase)}`;

  return (
    <div>
      <Block padding="m 0">
        <Text
          text="The seed phrase to your account is:"
          size="s"
          weight="bold"
        />
      </Block>
      <Block padding="l 0">
        <Block
          padding="l"
          background="green"
          borderRadius="default"
        >
          <Text
            text={seedPhrase}
            weight="bold"
            size="l"
          />
        </Block>
      </Block>
      <Block padding="m 0 l">
        <Text size="xs">
          {'( '}
          <a
            href={downloadLink}
            download="seedPhrase.txt"
          >
            <TextButton
              theme="underline"
              text="Download text file"
            />
          </a>
          {' )'}
        </Text>
      </Block>
      <Block padding="l 0">
        <Text
          text="Please keep it in a safe place. You will need this to restore your account."
          size="xs"
        />
      </Block>
    </div>
  );
};

SeedPhrase.propTypes = {
  seedPhrase: PropTypes.string.isRequired,
};

export default SeedPhrase;
