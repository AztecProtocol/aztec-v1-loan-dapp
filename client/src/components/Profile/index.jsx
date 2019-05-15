import React from 'react';
import {
  FlexBox,
  Block,
  Avatar,
  Text,
  TextButton,
} from '@aztec/guacamole-ui';
import AuthService from '../../helpers/AuthService';

const Profile = () => (
  <FlexBox valign="center">
    <Avatar
      iconName="person"
      size="m"
    />
    <Block left="l">
      <Text
        text={AuthService.address}
        size="xs"
        weight="bold"
      />
    </Block>
    <Block left="m">
      <TextButton
        theme="underline"
        text="(Logout)"
        size="xs"
        onClick={AuthService.logout}
      />
    </Block>
  </FlexBox>
);

export default Profile;
