import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
  Icon,
} from '@aztec/guacamole-ui';
import './Transferring.scss';

const Transferring = ({
  description,
  from,
  to,
}) => (
  <Block padding="m 0">
    <Block padding="s">
      <Text
        text={description}
      />
    </Block>
    <Block padding="s">
      <FlexBox
        align="center"
        valign="center"
      >
        <Block
          className="Transferring_item"
          padding="m l"
          align="right"
        >
          {from}
        </Block>
        <FlexBox
          align="center"
          valign="center"
        >
          <Block padding="s">
            <Icon
              className="Transferring_dot dot_0"
              name="chevron_right"
              size="l"
            />
          </Block>
          <Block padding="s">
            <Icon
              className="Transferring_dot dot_1"
              name="chevron_right"
              size="l"
            />
          </Block>
          <Block padding="s">
            <Icon
              className="Transferring_dot dot_2"
              name="chevron_right"
              size="l"
            />
          </Block>
        </FlexBox>
        <Block
          className="Transferring_item"
          padding="m l"
          align="left"
        >
          {to}
        </Block>
      </FlexBox>
    </Block>
  </Block>
);

Transferring.propTypes = {
  description: PropTypes.string,
  from: PropTypes.node.isRequired,
  to: PropTypes.node.isRequired,
};

Transferring.defaultProps = {
  description: '',
};

export default Transferring;
