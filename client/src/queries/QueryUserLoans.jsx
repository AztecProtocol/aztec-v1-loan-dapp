import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import transformLoanFromGraph from '../utils/transformLoanFromGraph';
import loanFields from './config/loanFields';
import QueryAndSubscribe from './helpers/QueryAndSubscribe';

const lenderLoansQuery = `
  userLoans($id: String) {
    user(id: $id) {
      loans: approvedLoans {
        ${loanFields}
      }
    }
  }
`.trim();

const borrowerLoanQuery = `
  userLoans($id: String) {
    user(id: $id) {
      loans {
        ${loanFields}
      }
    }
  }
`.trim();

const processData = (data) => {
  const loans = get(data, 'user.loans');

  return {
    loans: loans
      && loans.map(transformLoanFromGraph),
  };
};

const QueryUserLoans = ({
  role,
  currentAddress,
  children,
}) => {
  const query = role === 'borrower'
    ? borrowerLoanQuery
    : lenderLoansQuery;

  const variables = {
    id: currentAddress,
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

QueryUserLoans.propTypes = {
  role: PropTypes.oneOf(['borrower', 'lender']),
  currentAddress: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

QueryUserLoans.defaultProps = {
  role: 'lender',
};

export default QueryUserLoans;
