import React from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  Block,
  Text,
} from '@aztec/guacamole-ui';

const LoanTermCol = ({
  className,
  padding,
  column,
  label,
  text,
  children,
}) => (
  <Col
    className={className}
    column={column}
  >
    <Block padding={padding}>
      <Text
        size="xxs"
        color="label"
      >
        {label}
      </Text>
      <Block top="xs">
        {children}
        {!children && (
          <Text
            size="s"
            showEllipsis
          >
            {text}
          </Text>
        )}
      </Block>
    </Block>
  </Col>
);

LoanTermCol.propTypes = {
  className: PropTypes.string,
  padding: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  column: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
  ]),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  children: PropTypes.node,
};

LoanTermCol.defaultProps = {
  className: '',
  padding: 's 0',
  column: { xxs: 6, m: 3 },
  text: '',
  children: null,
};

export default LoanTermCol;
