# urql-persisted-queries

`urql-persisted-queries` implements Apollo-style [Automatic Persisted Queries](https://www.apollographql.com/docs/apollo-server/features/apq/) in [urql](https://formidable.com/open-source/urql/). From the Apollo docs:

> Apollo Server implements Automatic Persisted Queries (APQ), a technique that greatly improves network performance for GraphQL with zero build-time configuration. A persisted query is a ID or hash that can be sent to the server instead of the entire GraphQL query string. This smaller signature reduces bandwidth utilization and speeds up client loading times. Persisted queries are especially nice paired with GET requests, enabling the browser cache and integration with a CDN.
>
> With Automatic Persisted Queries, the ID is a deterministic hash of the input query, so we don't need a complex build step to share the ID between clients and servers. If a server doesn't know about a given hash, the client can expand the query for it; Apollo Server caches that mapping.

In order to use this, your GraphQL server needs to be compatible with it.

# Usage

To use `urql-persisted-queries`, you need to install it either via Yarn or npm:

```sh
yarn add urql-persisted-queries
```

Then in your JavaScript code, replace urql's regular `fetchExchange` with the `persistedFetchExchange`. For example:

```javascript
import { createClient, Provider, dedupExchange, cacheExchange } from 'urql';
import { persistedFetchExchange } from 'urql-persisted-queries';
// ...
const client = createClient({
  url: 'http://localhost:3001/graphql',
  exchanges: [dedupExchange, cacheExchange, persistedFetchExchange],
});
```

A basic example project is included in the `example` directory.
