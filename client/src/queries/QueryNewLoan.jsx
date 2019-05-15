import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import loanFields from './config/loanFields';
import QueryAndSubscribe from './helpers/QueryAndSubscribe';

const query = `
  newLoan {
    loans(first: 1, where: $where, orderBy: "createdAt", orderDirection: "desc") {
      ${loanFields}
    }
  }
`.trim();

const processData = (data) => {
  const loans = get(data, 'loans');

  return {
    loans,
  };
};

const QueryNewLoan = ({
  currentAddress,
  children,
}) => {
  const variables = {
    where: {
      borrower: currentAddress.toLowerCase(),
    },
  };

  return (
    <QueryAndSubscribe
      query={query}
      variables={variables}
      processData={processData}
    >
      {children}
    </QueryAndSubscribe>
  );
};

QueryNewLoan.propTypes = {
  currentAddress: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

export default QueryNewLoan;
