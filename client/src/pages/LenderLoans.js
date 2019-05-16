import React from 'react';
import PropTypes from 'prop-types';
import QueryUserLoans from '../queries/QueryUserLoans';
import VisibleLoans from '../components/VisibleLoans';

const LenderLoans = ({
  currentAddress,
}) => (
  <VisibleLoans
    Query={QueryUserLoans}
    loanType="approved"
    emptyMessage="You don't have any approved loans yet."
    currentAddress={currentAddress}
  />
);

LenderLoans.propTypes = {
  currentAddress: PropTypes.string.isRequired,
};

export default LenderLoans;
