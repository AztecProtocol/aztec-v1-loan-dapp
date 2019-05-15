import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';
import statusTagConfig from './config/statusTag';

const LoanTag = ({
  status,
}) => {
  const config = statusTagConfig[status];
  if (!config) {
    return null;
  }

  const {
    background,
    text,
    color,
  } = config;

  return (
    <Block
      padding="xxs m"
      background={background}
      borderRadius="l"
      inline
    >
      <Text
        text={text}
        color={color}
        size="xxs"
        weight="bold"
      />
    </Block>
  );
};

LoanTag.propTypes = {
  status: PropTypes.string.isRequired,
};

export default LoanTag;
