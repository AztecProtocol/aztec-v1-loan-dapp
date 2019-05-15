import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
  Icon,
} from '@aztec/guacamole-ui';

const Message = ({
  type,
  message,
}) => {
  let iconProps;
  switch (type) {
    case 'success':
      iconProps = {
        name: 'check_circle',
        color: 'green',
      };
      break;
    case 'warn':
      iconProps = {
        name: 'warning',
        color: 'red',
      };
      break;
    case 'error':
      iconProps = {
        name: 'error',
        color: 'red',
      };
      break;
    default:
  }

  return (
    <Block
      padding="m 0"
    >
      <FlexBox
        direction="column"
        align="center"
        valign="center"
      >
        {iconProps && (
          <Block padding="s">
            <Icon
              size="m"
              {...iconProps}
            />
          </Block>
        )}
        <Block padding="s">
          <Text
            weight="semibold"
            size="xs"
          >
            {message}
          </Text>
        </Block>
      </FlexBox>
    </Block>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf([
    'success',
    'warn',
    'error',
  ]),
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
};

export default Message;
