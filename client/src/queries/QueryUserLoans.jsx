import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import transformLoanFromGraph from '../utils/transformLoanFromGraph';
import isSameAddress from '../utils/isSameAddress';
import loanFields from './config/loanFields';
import QueryAndSubscribe from './helpers/QueryAndSubscribe';

const lenderLoansQuery = `
  userLoans($id: String) {
    user(id: $id) {
      loans: settledLoans {
        ${loanFields}
      }
    }
  }
`.trim();

const approvedLoansQuery = `
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

const processData = (data, loanType, currentAddress) => {
  let loans = get(data, 'user.loans');
  if (loanType === 'approved' && loans) {
    loans = loans.filter(({
      lender,
    }) => !lender || isSameAddress(lender.address, currentAddress));
  }

  return {
    loans: loans
      && loans.map(transformLoanFromGraph),
  };
};

const QueryUserLoans = ({
  loanType,
  currentAddress,
  children,
}) => {
  let query;
  switch (loanType) {
    case 'borrower':
      query = borrowerLoanQuery;
      break;
    case 'lender':
      query = lenderLoansQuery;
      break;
    case 'approved':
      query = approvedLoansQuery;
      break;
    default:
  }

  const variables = {
    id: currentAddress,
  };

  return (
    <QueryAndSubscribe
      query={query}
      variables={variables}
      processData={data => processData(data, loanType, currentAddress)}
    >
      {children}
    </QueryAndSubscribe>
  );
};

QueryUserLoans.propTypes = {
  loanType: PropTypes.oneOf([
    'borrower',
    'lender',
    'approved',
  ]),
  currentAddress: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

QueryUserLoans.defaultProps = {
  loanType: 'approved',
};

export default QueryUserLoans;
