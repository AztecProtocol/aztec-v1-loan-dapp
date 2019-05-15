import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
  Loader,
} from '@aztec/guacamole-ui';
import loanStatus from '../../utils/loanStatus';
import getShortenAddress from '../../utils/getShortenAddress';
import {
  format,
} from '../../utils/currency';
import PayableInterest from '../PayableInterest';
import LoanTermCol from './LoanTermCol';

const LenderInfo = ({
  loan,
  notionalValue,
  balanceValue,
}) => {
  const {
    borrower,
    status,
  } = loan;

  const infoCols = [
    <LoanTermCol
      key="borrower"
      label="Borrower"
      text={getShortenAddress(borrower.address)}
    />
  ];

  if (status === loanStatus('settled')) {
    const label = 'Accrued Interest (Balance)';
    let valueNode;
    if (notionalValue === null || balanceValue === null) {
      valueNode = (
        <Loader
          size="xxs"
        />
      );
    } else {
      const {
        settlementCurrencyId,
      } = loan;
      valueNode = (
        <PayableInterest
          loan={loan}
          notionalValue={notionalValue}
        >
          {({ payableInterest }) => (
            <FlexBox>
              <Text
                text={format(payableInterest, settlementCurrencyId)}
              />
              <Block left="s">
                {'('}
                <Text
                  text={format(balanceValue, settlementCurrencyId)}
                  color={payableInterest > balanceValue ? 'red' : ''}
                  weight={payableInterest > balanceValue ? 'bold' : 'normal'}
                />
                {')'}
              </Block>
            </FlexBox>
          )}
        </PayableInterest>
      );
    }

    infoCols.push(
      <LoanTermCol
        key="available-interest"
        label={label}
        text={valueNode}
      />
    );
  } else if (status === loanStatus('default')) {
    let valueNode;
    if (balanceValue === null) {
      valueNode = (
        <Loader
          size="xxs"
        />
      );
    } else {
      const {
        settlementCurrencyId,
      } = loan;
      valueNode = (
        <Text
          text={format(balanceValue, settlementCurrencyId)}
        />
      );
    }
    infoCols.push(
      <LoanTermCol
        key="account-balance"
        label="Account Balance"
        text={valueNode}
      />
    );
  }

  return infoCols;
};

LenderInfo.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    borrower: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }).isRequired,
    settlementCurrencyId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
};

export default LenderInfo;
