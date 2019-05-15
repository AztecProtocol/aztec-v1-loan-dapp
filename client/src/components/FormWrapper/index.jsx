import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
} from '@aztec/guacamole-ui';
import './Form.scss';

const FormWrapper = ({
  children,
}) => (
  <Block
    className="Form-wrapper"
    padding="l xl"
    background="white"
    borderRadius="default"
    layer={1}
  >
    {children}
  </Block>
);

FormWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FormWrapper;
