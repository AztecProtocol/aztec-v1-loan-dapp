import React from 'react';
import PropTypes from 'prop-types';
import BorrowerActions from './BorrowerActions';
import LenderActions from './LenderActions';

const LoanActions = ({
  role,
  currentAddress,
  loan,
  notionalValue,
  balanceValue,
}) => {
  if (!role) {
    return null;
  }

  const ActionTag = role === 'borrower'
    ? BorrowerActions
    : LenderActions;

  return (
    <ActionTag
      currentAddress={currentAddress}
      loan={loan}
      notionalValue={notionalValue}
      balanceValue={balanceValue}
    />
  );
};

LoanActions.propTypes = {
  role: PropTypes.oneOf(['', 'borrower', 'lender']),
  currentAddress: PropTypes.string.isRequired,
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
};

export default LoanActions;
