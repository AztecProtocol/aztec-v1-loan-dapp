import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import buildConfig from './build/config';

const network = process.env.NODE_ENV || 'development';

const {
  graphQLHttpServer,
  graphQLWebSocketServer,
} = buildConfig.networks[network] || {};

const cache = new InMemoryCache();

const httpLink = new HttpLink({
  uri: graphQLHttpServer,
});

const wsLink = new WebSocketLink({
  uri: graphQLWebSocketServer,
  options: {
    reconnect: true,
  },
});

const link = split(
  // split based on operation type
  ({
    query,
  }) => {
    const {
      kind,
      operation,
    } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  cache,
  link,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
  },
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
