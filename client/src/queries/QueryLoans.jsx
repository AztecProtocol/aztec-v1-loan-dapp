import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isSameAddress from '../utils/isSameAddress';
import transformLoanFromGraph from '../utils/transformLoanFromGraph';
import loanFields from './config/loanFields';
import QueryAndSubscribe from './helpers/QueryAndSubscribe';

const query = `
  loans($first: Int, $where: Loan_filter, $orderBy: Loan_orderBy, $orderDirection: OrderDirection) {
    loans(first: $first, where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${loanFields}
    }
  }
`.trim();

const processData = (data, loanType, currentAddress) => {
  let loans = get(data, 'loans');
  if (loanType === 'pending' && loans) {
    loans = loans.filter(({
      lenderAccess = [],
    }) => !lenderAccess
      || !lenderAccess.find(({
        user: {
          address,
        },
      }) => isSameAddress(address, currentAddress)));
  }

  return {
    loans: loans && loans.map(transformLoanFromGraph),
  };
};

const QueryLoans = ({
  loanType,
  currentAddress,
  loansPerPage,
  minId,
  orderBy,
  orderDirection,
  children,
}) => {
  const whereClause = {
    id_gte: `0x${(minId).toString(16)}`,
  };
  switch (loanType) {
    case 'borrower':
      whereClause.borrower = currentAddress.toLowerCase();
      whereClause.status_not = '';
      break;
    case 'pending':
      whereClause.borrower_not = currentAddress.toLowerCase();
      whereClause.status = 'PENDING';
      break;
    case 'lender':
      whereClause.lender = currentAddress.toLowerCase();
      break;
    default:
  }

  const variables = {
    first: loansPerPage,
    where: whereClause,
    orderBy,
    orderDirection,
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

QueryLoans.propTypes = {
  loanType: PropTypes.string,
  currentAddress: PropTypes.string.isRequired,
  loansPerPage: PropTypes.number,
  minId: PropTypes.number,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
  children: PropTypes.func.isRequired,
};

QueryLoans.defaultProps = {
  loanType: '',
  loansPerPage: 100,
  minId: 1,
  orderBy: 'createdAt',
  orderDirection: 'desc',
};

export default QueryLoans;
