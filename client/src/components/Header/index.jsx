import React from 'react';
import PropTypes from 'prop-types';
import {
  Link,
} from 'react-router-dom';
import {
  PageContentWrapper,
  Block,
  FlexBox,
  TextButton,
} from '@aztec/guacamole-ui';
import AuthService from '../../helpers/AuthService';
import {
  getPathByPageName,
} from '../../utils/page';
import getShortenAddress from '../../utils/getShortenAddress';
import NoteBalanceSummary from '../NoteBalanceSummary';

const Header = ({
  className,
  onLogout,
}) => (
  <PageContentWrapper
    className={className}
    background="primary"
    alignCenter
  >
    <FlexBox
      align="space-between"
      valign="center"
    >
      <TextButton
        theme="normal"
        size="s"
        text="Loan Dapp Starter Kit"
        color="white"
        weight="semibold"
        href="/"
        Link={Link}
      />
      {!!AuthService.address && (
        <FlexBox valign="center">
          <Block right="m">
            <NoteBalanceSummary
              currentAddress={AuthService.address}
            />
          </Block>
          <TextButton
            theme="underline"
            text={`(${getShortenAddress(AuthService.address)})`}
            size="xs"
            color="white-light"
            href={getPathByPageName('balance')}
            Link={Link}
          />
        </FlexBox>
      )}
    </FlexBox>
  </PageContentWrapper>
);

Header.propTypes = {
  className: PropTypes.string,
};

Header.defaultProps = {
  className: '',
};

export default Header;
