import React from 'react';
import PropTypes from 'prop-types';
import QueryLoans from '../queries/QueryLoans';
import VisibleLoans from '../components/VisibleLoans';

const PendingLoans = ({
  currentAddress,
}) => (
  <VisibleLoans
    Query={QueryLoans}
    loanType="pending"
    emptyMessage="No pending loans."
    currentAddress={currentAddress}
  />
);

PendingLoans.propTypes = {
  currentAddress: PropTypes.string.isRequired,
};

export default PendingLoans;
