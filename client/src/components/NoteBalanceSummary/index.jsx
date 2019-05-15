import React from 'react';
import PropTypes from 'prop-types';
import QueryUserBalance from '../../queries/QueryUserBalance';
import Summary from './Summary';

const NoteBalanceSummary = ({
  currentAddress,
}) => (
  <QueryUserBalance
    currentAddress={currentAddress}
  >
    {({
      data,
      error,
      isLoading,
    }) => {
      let balanceNotes = null;
      if (error) {
        balanceNotes = [];
      } else if (!isLoading) {
        balanceNotes = data.balance;
      }

      return (
        <Summary
          balanceNotes={balanceNotes}
          isLoading={isLoading}
        />
      );
    }}
  </QueryUserBalance>
);

NoteBalanceSummary.propTypes = {
  currentAddress: PropTypes.string,
};

export default NoteBalanceSummary;
