import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
} from '@aztec/guacamole-ui';
import Profile from '../components/Profile';
import Assets from '../components/Assets';

const AccountBalance = ({
  currentAddress,
}) => (
  <div>
    <Block bottom="xl">
      <Profile />
    </Block>
    <Assets
      currentAddress={currentAddress}
    />
  </div>
);

AccountBalance.propTypes = {
  currentAddress: PropTypes.string.isRequired,
};

export default AccountBalance;
