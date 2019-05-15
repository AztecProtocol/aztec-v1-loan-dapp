import React from 'react';
import PropTypes from 'prop-types';
import {
  Query,
} from 'react-apollo';
import gql from 'graphql-tag';
import QueryDataHandler from './QueryDataHandler';

const LOAD_QUERY = query => gql`
  query ${query}
`;

const QueryAndSubscribe = ({
  query,
  variables,
  processData,
  children,
}) => (
  <Query
    query={LOAD_QUERY(query)}
    variables={variables}
  >
    {({
      loading,
      error,
      data,
      subscribeToMore,
    }) => (
      <QueryDataHandler
        query={query}
        variables={variables}
        data={data}
        processData={processData}
        error={error}
        isLoading={loading}
        subscribeToMore={subscribeToMore}
      >
        {children}
      </QueryDataHandler>
    )}
  </Query>
);

QueryAndSubscribe.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  processData: PropTypes.func,
  children: PropTypes.func.isRequired,
};

QueryAndSubscribe.defaultProps = {
  variables: {},
  processData: data => data,
};

export default QueryAndSubscribe;
