import { Operation, CombinedError } from 'urql';

export interface FetchResult {
  operation: Operation;
  data: any;
  error: CombinedError | undefined;
}

function checkStatus(redirectMode: string = 'follow', response: Response) {
  const statusRangeEnd = redirectMode === 'manual' ? 400 : 300;

  if (response.status < 200 || response.status > statusRangeEnd) {
    throw new Error(response.statusText);
  }
}

export async function executeFetch(
  operation: Operation,
  body: any,
  abortController: AbortController | undefined,
): Promise<FetchResult | undefined> {
  const { context } = operation;

  const extraOptions =
    typeof context.fetchOptions === 'function'
      ? context.fetchOptions()
      : context.fetchOptions || {};

  const fetchOptions = {
    body: JSON.stringify(body),
    method: 'POST',
    ...extraOptions,
    headers: {
      'content-type': 'application/json',
      ...extraOptions.headers,
    },
    signal: abortController !== undefined ? abortController.signal : undefined,
  };

  let response: Response | undefined;
  try {
    response = await fetch(context.url, fetchOptions);
    checkStatus(fetchOptions.redirect, response);
    const result = await response.json();
    return {
      operation,
      data: result.data,
      error: Array.isArray(result.errors)
        ? new CombinedError({
            graphQLErrors: result.errors,
            response,
          })
        : undefined,
    };
  } catch (err) {
    return err.name === 'AbortError'
      ? undefined
      : {
          operation,
          data: undefined,
          error: new CombinedError({
            networkError: err,
            response,
          }),
        };
  }
}

export const enum QueryStatus {
  PersistedQueryNotFound = 'PersistedQueryNotFound',
  PersistedQueryNotSupported = 'PersistedQueryNotSupported',
  Other = 'Other',
}

export function getQueryStatus(result: FetchResult | undefined): QueryStatus {
  if (result && result.error) {
    if (
      result.error.graphQLErrors.some(
        x => x.message === 'PersistedQueryNotFound',
      )
    ) {
      return QueryStatus.PersistedQueryNotFound;
    }

    if (
      result.error.graphQLErrors.some(
        x => x.message === 'PersistedQueryNotSupported',
      )
    ) {
      return QueryStatus.PersistedQueryNotSupported;
    }
  }

  return QueryStatus.Other;
}
