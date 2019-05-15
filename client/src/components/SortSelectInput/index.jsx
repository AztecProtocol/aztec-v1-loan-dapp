import React from 'react';
import {
  FlexBox,
  Block,
  Text,
  Icon,
} from '@aztec/guacamole-ui';
import './SortSelectInput.scss';

const SortSelectInput = ({
  status,
  value,
  onClick,
}) => (
  <Block
    className={`SortSelectInput_wrapper${status === 'focus' ? ' focused' : ''}`}
    padding="xs"
    onClick={onClick}
  >
    <FlexBox
      valign="center"
    >
      <Block right="s">
        <Text
          text="Sort By:"
          size="xs"
        />
      </Block>
      <Text
        className="SortSelectInput_value"
        size="xs"
        text={value}
      />
      <Block left="xs">
        <Icon
          name={status === 'focus' ? 'expand_less' : 'expand_more'}
          size="s"
          color="secondary"
        />
      </Block>
    </FlexBox>
  </Block>
);

export default SortSelectInput;
