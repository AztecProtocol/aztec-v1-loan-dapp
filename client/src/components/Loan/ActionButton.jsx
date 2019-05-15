import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Button,
  TextButton,
} from '@aztec/guacamole-ui';

const ActionButton = ({
  theme,
  text,
  onClick,
  onSubmit,
  disabled,
}) => {
  let buttonNode;
  if (theme === 'secondary') {
    buttonNode = (
      <TextButton
        theme="underline"
        text={text}
        color="label"
        size="xs"
        onClick={onClick}
        disabled={disabled}
      />
    );
  } else {
    buttonNode = (
      <Button
        theme="primary"
        size="s"
        text={text}
        onClick={onClick}
        onSubmit={onSubmit}
        disabled={disabled}
        outlined
        expand
      />
    );
  }

  return (
    <Block
      padding="xs 0"
      align="center"
    >
      {buttonNode}
    </Block>
  );
};

ActionButton.propTypes = {
  theme: PropTypes.oneOf(['primary', 'secondary']),
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onSubmit: PropTypes.func,
  disabled: PropTypes.bool,
};

ActionButton.defaultProps = {
  theme: 'primary',
  disabled: false,
};

export default ActionButton;
