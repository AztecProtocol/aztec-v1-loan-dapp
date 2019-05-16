import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
  Loader,
} from '@aztec/guacamole-ui';
import {
  format,
} from '../../utils/currency';
import getShortenAddress from '../../utils/getShortenAddress';
import loanStatus from '../../utils/loanStatus';
import PayableInterest from '../PayableInterest';
import LoanTermCol from './LoanTermCol';

const BorrowerInfo = ({
  loan,
  notionalValue,
  balanceValue,
}) => {
  const {
    lender,
    status,
  } = loan;

  const infoCols = [];
  if (lender && +lender.address > 0) {
    infoCols.push(
      <LoanTermCol
        key="lender"
        label="Lender"
        text={getShortenAddress(lender.address)}
      />
    );
  }

  switch (status) {
    case loanStatus('pending'):
    case loanStatus('awaiting_settlement'): {
      const {
        viewRequests,
        lenderAccess,
      } = loan;
      const totalRequests = viewRequests.length;
      const approvedRequests = lenderAccess.length;
      const unapprovedRequests = totalRequests - approvedRequests;
      infoCols.push(
        <LoanTermCol
          key="received-requests"
          label="Received View Requests"
          text={`${totalRequests}`}
        />
      );
      if (unapprovedRequests) {
        infoCols.push(
          <LoanTermCol
            key="unapproved-requests"
            label="Pending View Requests"
            text={(
              <Text
                text={`${unapprovedRequests || 0}`}
                color={unapprovedRequests ? 'red' : ''}
                weight={unapprovedRequests ? 'semibold' : ''}
              />
            )}
          />
        );
      }
      break;
    }
    case loanStatus('settled'):
    case loanStatus('default'): {
      let label = 'Account Balance (Owed Interest)';
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
                  text={format(balanceValue, settlementCurrencyId)}
                />
                <Block left="s">
                  {'('}
                  <Text
                    text={format(payableInterest, settlementCurrencyId)}
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
          key="balance"
          label={label}
          text={valueNode}
        />
      );
      break;
    }
    default:
  }

  return infoCols;
};

BorrowerInfo.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    lender: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }),
    viewRequests: PropTypes.array.isRequired,
    lenderAccess: PropTypes.array.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
};

export default BorrowerInfo;
