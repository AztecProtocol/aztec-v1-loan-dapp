import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
  Icon,
} from '@aztec/guacamole-ui';
import EncryptedValue from '../EncryptedValue';
import './Asset.scss';

const Asset = ({
  img,
  name,
  balance,
  unit,
  isDecrypting,
}) => (
  <FlexBox
    align={{ s: 'flex-start', xxs: 'space-between' }}
    valign="center"
  >
    <FlexBox valign="center">
      <Block right="s">
        {!!img && (
          <img
            className="Asset_icon"
            alt=""
            src={img}
          />
        )}
        {!img && (
          <Block
            className="Asset_icon"
            background="grey-light"
          >
            <FlexBox
              valign="center"
              align="center"
            >
              <Icon
                name="widgets"
                size="s"
              />
            </FlexBox>
          </Block>
        )}
      </Block>
      {!!name && (
        <Block
          className="Asset_currency-name"
          padding="0 m"
        >
          <Text
            text={name}
            size="s"
            weight="semibold"
          />
        </Block>
      )}
    </FlexBox>
    <FlexBox valign="center">
      <Block left="xl">
        <EncryptedValue
          value={balance}
          size="s"
          isDecrypting={isDecrypting}
        />
      </Block>
      {!!unit && (
        <Block left="s">
          <Text
            text={unit}
            size="s"
            color="label"
          />
        </Block>
      )}
    </FlexBox>
  </FlexBox>
);

Asset.propTypes = {
  img: PropTypes.string,
  name: PropTypes.string.isRequired,
  balance: PropTypes.number,
  unit: PropTypes.string,
  isDecrypting: PropTypes.bool,
};

Asset.defaultProps = {
  img: '',
  unit: '',
  balance: 0,
  isDecrypting: false,
};

export default Asset;
