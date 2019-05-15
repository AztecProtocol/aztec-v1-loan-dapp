import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Checkbox,
  Text,
  Icon,
} from '@aztec/guacamole-ui';

const RequestCheckbox = ({
  viewRequest: {
    lenderAddress,
  },
  selected,
  onSelect,
  approved,
}) => (
  <Block
    className={!approved ? 'clickable' : ''}
    padding="s 0"
    background={selected ? 'grey-lightest' : ''}
    borderRadius="default"
    onClick={!approved ? () => onSelect(lenderAddress) : undefined}
  >
    <FlexBox
      valign="center"
      nowrap
    >
      <Block
        className="flex-fixed"
        padding="0 m"
      >
        {!approved && (
          <Checkbox
            value={selected}
          />
        )}
        {!!approved && (
          <Icon
            name="check_circle"
            color="green"
            size="m"
          />
        )}
      </Block>
      <Block
        className="flex-free-expand"
        padding="0 s"
      >
        <Text
          text={lenderAddress || ''}
          size="xxs"
        />
      </Block>
    </FlexBox>
  </Block>
);

RequestCheckbox.propTypes = {
  viewRequest: PropTypes.shape({
    lenderAddress: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.bool,
  approved: PropTypes.bool,
  onSelect: PropTypes.func,
};

RequestCheckbox.defaultProps = {
  selected: false,
  approved: false,
  onSelect: null,
};

export default RequestCheckbox;
