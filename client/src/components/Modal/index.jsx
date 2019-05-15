import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal as GuacamoleModal,
  Block,
  Text,
  Icon,
} from '@aztec/guacamole-ui';
import './Modal.scss';

const Modal = ({
  title,
  iconName,
  children,
}) => (
  <div className="Modal_wrapper">
    <GuacamoleModal
      valign="center"
      clickOverlayToClose={false}
      hasCloseIcon={false}
      autoWidth
    >
      <div className="Modal_content">
        {title && (
          <Block
            padding="l"
            align="center"
          >
            <Text
              text={title}
              size="s"
              color="label"
              weight="semibold"
            />
          </Block>
        )}
        <div className="Modal_separator">
          <div className="Modal_icon">
            <Icon
              name={iconName}
              size="xxs"
              color="label"
            />
          </div>
        </div>
        {children}
      </div>
    </GuacamoleModal>
  </div>
);

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  iconName: PropTypes.string,
  children: PropTypes.node,
};

Modal.defaultProps = {
  iconName: 'security',
  children: null,
};

export default Modal;
