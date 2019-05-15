import React from 'react';
import PropTypes from 'prop-types';
import BorrowerInfo from './BorrowerInfo';
import LenderInfo from './LenderInfo';

const ExtraInfoCols = ({
  role,
  loan,
  notionalValue,
  balanceValue,
}) => {
  if (!role) {
    return null;
  }

  const InfoTag = role === 'borrower'
    ? BorrowerInfo
    : LenderInfo;

  return (
    <InfoTag
      loan={loan}
      notionalValue={notionalValue}
      balanceValue={balanceValue}
    />
  );
};

ExtraInfoCols.propTypes = {
  role: PropTypes.oneOf(['', 'borrower', 'lender']),
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
};

ExtraInfoCols.defaultProps = {
  role: '',
};

export default ExtraInfoCols;
