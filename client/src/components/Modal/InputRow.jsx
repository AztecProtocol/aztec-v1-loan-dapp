import React from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Block,
  Text,
} from '@aztec/guacamole-ui';

const InputRow = ({
  label,
  value,
  children,
  inputColumn,
}) => (
  <Block
    padding="s 0"
  >
    <Row valign="center">
      <Col
        column={12 - inputColumn}
        align="left"
      >
        <Text
          text={label}
          size="xs"
          color="label"
          weight="semibold"
        />
      </Col>
      <Col
        column={inputColumn}
        align="right"
      >
        {value && (
          <Block right="s">
            <Text
              text={value}
              size="s"
            />
          </Block>
        )}
        {children}
      </Col>
    </Row>
  </Block>
);

InputRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  children: PropTypes.node,
  inputColumn: PropTypes.number,
};

InputRow.defaultProps = {
  value: '',
  children: null,
  inputColumn: 7,
};

export default InputRow;
