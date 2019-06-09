import React, { FC } from 'react';
import * as ReactDOM from 'react-dom';
import { createClient, Provider, dedupExchange, cacheExchange } from 'urql';
import { persistedFetchExchange } from 'urql-persisted-queries';
import { Home } from './Home';
import './index.css';

const client = createClient({
  url: 'http://localhost:3001/graphql',
  exchanges: [dedupExchange, cacheExchange, persistedFetchExchange],
});

export const App: FC = () => (
  <Provider value={client}>
    <main>
      <h1>Todos</h1>
      <Home />
    </main>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));
