import gql from 'graphql-tag';

import ApolloClient, { InMemoryCache } from 'apollo-boost';

import { environment } from 'environment';

// Setup the Apollo Client
const client = new ApolloClient({
    uri: environment.GRAPHQL_API,
    cache: new InMemoryCache()
});

const query = query => client.query({ query: gql(query) });
const mutate = query => client.mutate({ mutation: gql(query) });

export { client, query, mutate };
