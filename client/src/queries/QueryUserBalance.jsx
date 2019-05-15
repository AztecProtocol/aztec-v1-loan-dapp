import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import transformNoteAccessFromGraph from '../utils/transformNoteAccessFromGraph';
import QueryAndSubscribe from './helpers/QueryAndSubscribe';

const query = `
  user($id: ID!) {
    user(id: $id) {
      balanceAccess {
        note {
          id
          status
          currencyAddress,
        }
        sharedSecret
      }
    }
  }
`;

const processData = (data) => {
  const balanceAccess = get(data, 'user.balanceAccess');

  return {
    balance: balanceAccess
      && balanceAccess.map(transformNoteAccessFromGraph),
  };
};

const QueryUserBalance = ({
  currentAddress,
  children,
}) => {
  if (!currentAddress) {
    return null;
  }

  const variables = {
    id: currentAddress.toLowerCase(),
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

QueryUserBalance.propTypes = {
  currentAddress: PropTypes.string,
  children: PropTypes.func.isRequired,
};

QueryUserBalance.defaultProps = {
  currentAddress: '',
};

export default QueryUserBalance;
