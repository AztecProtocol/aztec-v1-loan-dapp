import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Block,
  Icon,
  Loader,
} from '@aztec/guacamole-ui';
import {
  shiftSize,
} from '@aztec/guacamole-ui/dist/config/shapes';
import './EncryptedValueLoader.scss';

const EncryptedValueLoader = ({
  className,
  color,
  background,
  size,
}) => (
  <Block
    className={classnames(
      className,
      'EncryptedValueLoader_locked-loader-wrapper',
    )}
    borderRadius="circular"
    background={background}
    inline
  >
    <Loader
      theme={color
        || (background && !background.startsWith('white')
          ? 'white'
          : 'secondary')
      }
      size={shiftSize(size, 1)}
    />
    <Icon
      className="EncryptedValueLoader_lock"
      name="locked"
      size={size}
    />
  </Block>
);

EncryptedValueLoader.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf(['', 'white', 'secondary', 'primary']),
  background: PropTypes.string,
  size: PropTypes.string.isRequired,
};

EncryptedValueLoader.defaultProps = {
  className: '',
  color: '',
  background: '',
};

export default EncryptedValueLoader;
