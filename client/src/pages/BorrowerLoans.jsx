import React from 'react';
import PropTypes from 'prop-types';
import QueryLoans from '../queries/QueryLoans';
import VisibleLoans from '../components/VisibleLoans';

const BorrowerLoans = ({
  currentAddress,
}) => (
  <VisibleLoans
    Query={QueryLoans}
    loanType="borrower"
    emptyMessage="You haven't issued any loans yet."
    currentAddress={currentAddress}
  />
);

BorrowerLoans.propTypes = {
  currentAddress: PropTypes.string.isRequired,
};

export default BorrowerLoans;
