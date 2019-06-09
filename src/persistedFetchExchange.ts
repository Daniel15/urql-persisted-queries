/* eslint-disable @typescript-eslint/no-use-before-define */

import { print } from 'graphql';
import { filter, make, merge, mergeMap, pipe, share, takeUntil } from 'wonka';
import { Exchange, Operation, OperationResult } from 'urql';
import { sha256, isCryptoSupported } from './crypto';
import {
  FetchResult,
  executeFetch,
  getQueryStatus,
  QueryStatus,
} from './queryFetcher';

/** An exchange that implements Apollo's "automatic persisted queries" functionality */
export const persistedFetchExchange: Exchange = ({ forward }) => {
  // If the browser doesn't support Web Crypto, don't bother using persisted queries
  let arePersistedQueriesSupported = isCryptoSupported();

  const createFetchSource = (operation: Operation) => {
    if (operation.operationName === 'subscription') {
      throw new Error(
        'Received a subscription operation in the httpExchange. You are probably trying to create a subscription. Have you added a subscriptionExchange?',
      );
    }

    return make<OperationResult>(([next, complete]) => {
      const abortController =
        typeof AbortController !== 'undefined'
          ? new AbortController()
          : undefined;

      executeQuery(operation, abortController).then(result => {
        if (result !== undefined) {
          next(result);
        }

        complete();
      });

      return () => {
        if (abortController !== undefined) {
          abortController.abort();
        }
      };
    });
  };

  async function executeQuery(
    operation: Operation,
    abortController: AbortController | undefined,
    includeQueryText: boolean = !arePersistedQueriesSupported,
  ): Promise<FetchResult | undefined> {
    const query = print(operation.query);
    const body = {
      query: includeQueryText ? query : undefined,
      variables: operation.variables,
      extensions: {
        persistedQuery: arePersistedQueriesSupported
          ? {
              version: 1,
              sha256Hash: await sha256(query),
            }
          : undefined,
      },
    };

    const result = await executeFetch(operation, body, abortController);
    const queryStatus = getQueryStatus(result);
    switch (queryStatus) {
      case QueryStatus.PersistedQueryNotSupported:
        // Server reported that it doesn't support persisted queries, so never try to send them.
        arePersistedQueriesSupported = false;
        return await executeQuery(operation, abortController, true);

      case QueryStatus.PersistedQueryNotFound:
        // Re-run the request, but this time include the query text
        return await executeQuery(operation, abortController, true);

      case QueryStatus.Other:
        return result;
    }
  }

  return ops$ => {
    const sharedOps$ = share(ops$);
    const fetchResults$ = pipe(
      sharedOps$,
      filter(isOperationFetchable),
      mergeMap(operation => {
        const { key } = operation;
        const teardown$ = pipe(
          sharedOps$,
          filter(op => op.operationName === 'teardown' && op.key === key),
        );

        return pipe(
          createFetchSource(operation),
          takeUntil(teardown$),
        );
      }),
    );

    const forward$ = pipe(
      sharedOps$,
      filter(op => !isOperationFetchable(op)),
      forward,
    );

    return merge([fetchResults$, forward$]);
  };
};

function isOperationFetchable(operation: Operation) {
  const { operationName } = operation;
  return operationName === 'query' || operationName === 'mutation';
}
