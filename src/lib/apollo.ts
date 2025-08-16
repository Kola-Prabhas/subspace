import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { nhost } from './nhost';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
	uri: import.meta.env.VITE_NHOST_GRAPHQL_URL,
});

// Auth link for HTTP (async so we always pick up the latest token)
const authLink = setContext(async (_, { headers }) => {
	const token = await nhost.auth.getAccessToken();
	return {
		headers: {
			...headers,
			// use lowercase 'authorization' consistently
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
	};
});

// WebSocket link for subscriptions (graphql-ws)
const wsLink = new GraphQLWsLink(
	createClient({
		url: import.meta.env.VITE_NHOST_GRAPHQL_WS_URL,
		// connectionParams can be a function that returns the auth header
		connectionParams: async () => {
			const token = await nhost.auth.getAccessToken();
			// Hasura accepts headers under 'headers', but lowercase key is fine and consistent
			return token ? { headers: { authorization: `Bearer ${token}` } } : {};
		},
		// lazy: true will wait until a subscription is actually created before opening the socket
		lazy: true,
		// optional: keepAlive to keep the connection alive on some servers
		// keepAlive: 120_000,
	})
);

// Split link: route subscriptions to wsLink, queries/mutations to http (with auth)
const splitLink = split(
	({ query }) => {
		const def = getMainDefinition(query);
		return def.kind === 'OperationDefinition' && def.operation === 'subscription';
	},
	wsLink,
	from([authLink, httpLink])
);

export const apolloClient = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
});
