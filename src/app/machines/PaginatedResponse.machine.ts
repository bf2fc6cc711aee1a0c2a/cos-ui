import { useCallback } from 'react';

import { useSelector } from '@xstate/react';
import { ActorRef, ActorRefFrom, Sender, spawn } from 'xstate';
import { pure, sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

export const DEFAULT_PAGE_SIZE = 20;

export type PaginatedApiErrorResponse = { page: number; error: string };
export type PaginatedApiSuccessResponse<RawDataType> = {
  items: Array<RawDataType>;
  page: number;
  size: number;
  total: number;
};
export type PaginatedApiCallback<RawDataType, OrderBy, Search> = (
  request: PaginatedApiRequest<OrderBy, Search>,
  onSuccess: (payload: PaginatedApiSuccessResponse<RawDataType>) => void,
  onError: (payload: PaginatedApiErrorResponse) => void
) => () => void;
export type PlaceholderOrderBy = object;
export type PlaceholderSearch = object;
export type PaginatedApiRequest<OrderBy, Search> = {
  page: number;
  size: number;
  orderBy?: OrderBy;
  search?: Search;
};
export type PaginatedApiResponse<DataType> = {
  total: number;
  items?: Array<DataType>;
  error?: string;
};
export type PaginatedMachineContext<RawDataType, OrderBy, Search, DataType> = {
  request: PaginatedApiRequest<OrderBy, Search>;
  response?: PaginatedApiResponse<DataType>;
  pollingEnabled: boolean;
  actor?: ActorRef<any>;
  dataTransformer: (response: RawDataType) => DataType;
  onBeforeSetResponse?: (previousData: DataType[] | undefined) => void;
};
export type PaginatedMachineOptions<DataType> = {
  initialPageSize?: number;
  pollingEnabled?: boolean;
  onBeforeSetResponse?: (previousResponse: DataType[] | undefined) => void;
};
export const getPaginatedApiMachineEvents = <
  RawDataType,
  OrderBy,
  Search,
  DataType
>() => ({
  'api.refresh': () => ({}),
  'api.nextPage': () => ({}),
  'api.prevPage': () => ({}),
  'api.query': (payload: PaginatedApiRequest<OrderBy, Search>) => payload,
  'api.setResponse': (payload: PaginatedApiSuccessResponse<RawDataType>) =>
    payload,
  'api.setError': (payload: PaginatedApiErrorResponse) => payload,

  // notifyParent
  'api.ready': () => ({}),
  'api.loading': (payload: PaginatedApiRequest<OrderBy, Search>) => payload,
  'api.success': (payload: PaginatedApiSuccessResponse<DataType>) => payload,
  'api.error': (payload: { error: string }) => payload,
});

export function makePaginatedApiMachine<RawDataType, OrderBy, Search, DataType>(
  service: PaginatedApiCallback<RawDataType, OrderBy, Search>,
  dataTransformer: (response: RawDataType) => DataType,
  options?: PaginatedMachineOptions<DataType>
) {
  const { pollingEnabled, initialPageSize, onBeforeSetResponse } =
    options || {};
  const model = createModel(
    {
      request: {
        page: 1,
        size: initialPageSize || DEFAULT_PAGE_SIZE,
      },
      response: undefined,
      pollingEnabled: pollingEnabled || false,
      onBeforeSetResponse: onBeforeSetResponse,
      dataTransformer,
    } as PaginatedMachineContext<RawDataType, OrderBy, Search, DataType>,
    {
      events: {
        ...getPaginatedApiMachineEvents<
          RawDataType,
          OrderBy,
          Search,
          DataType
        >(),
      },
      actions: {
        notifyReady: () => ({}),
        notifyLoading: () => ({}),
        notifySuccess: () => ({}),
        notifyError: () => ({}),
        forwardUnknownEventsToParent: () => ({}),
      },
    }
  );

  const setResponse = model.assign((context, e) => {
    if (e.page !== context.request.page) return {};
    if (context.onBeforeSetResponse) {
      context.onBeforeSetResponse(context.response?.items);
    }
    return {
      response: {
        items: e.items?.map((i) => context.dataTransformer(i)),
        total: e.total,
        error: undefined,
      },
    };
  }, 'api.setResponse');

  const fetch = model.assign((context) => {
    if (context.actor && context.actor.stop) {
      context.actor.stop();
    }
    // eslint-disable-next-line xstate/spawn-usage
    const actor = spawn(callApi(context));
    return { actor };
  });
  const setError = model.assign((context, e) => {
    if (e.page !== context.request.page) return {};
    return {
      response: {
        items: context.response?.items || [],
        total: context.response?.total || 0,
        error: e.error,
      },
    };
  }, 'api.setError');
  const increasePage = model.assign((context) => {
    return {
      request: {
        ...context.request,
        page: context.request.page + 1,
      },
    };
  }, 'api.nextPage');
  const decreasePage = model.assign((context) => {
    return {
      request: { ...context.request, page: context.request.page - 1 },
    };
  }, 'api.prevPage');
  const query = model.assign((context, event) => {
    const { page, size, orderBy, search } = event;
    return {
      request: {
        page: page || context.request.page,
        size: size || context.request.size,
        orderBy,
        search,
      },
    };
  }, 'api.query');

  const callApi =
    (
      context: PaginatedMachineContext<RawDataType, OrderBy, Search, DataType>
    ) =>
    (callback: Sender<any>) => {
      return service(
        context.request!,
        (payload: PaginatedApiSuccessResponse<RawDataType>) =>
          callback(model.events['api.setResponse'](payload)),
        (payload: PaginatedApiErrorResponse) =>
          callback(model.events['api.setError'](payload))
      );
    };

  return model.createMachine(
    {
      id: 'paginatedApiMachine',
      predictableActionArguments: true,
      context: model.initialContext,
      type: 'parallel',
      states: {
        api: {
          initial: 'idle',
          states: {
            idle: {
              entry: model.actions.notifyReady(),
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
              },
            },
            success: {
              always: [
                { target: 'queryEmpty', cond: 'isQueryEmpty' },
                { target: 'queryResults', cond: 'isQuerySuccesful' },
                { target: 'empty', cond: 'isTotalZero' },
                { target: 'results' },
              ],
            },
            queryEmpty: {
              tags: 'queryEmpty',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: decreasePage,
                  cond: 'isNotFirstPage',
                },
                'api.refresh': {
                  target: 'loading',
                },
              },
            },
            queryResults: {
              tags: 'queryResults',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
                'api.nextPage': {
                  target: 'loading',
                  actions: increasePage,
                  cond: 'isNotLastPage',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: decreasePage,
                  cond: 'isNotFirstPage',
                },
                'api.refresh': {
                  target: 'loading',
                },
              },
            },
            empty: {
              tags: 'empty',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
                'api.refresh': {
                  target: 'loading',
                },
              },
            },
            results: {
              tags: 'results',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
                'api.nextPage': {
                  target: 'loading',
                  actions: increasePage,
                  cond: 'isNotLastPage',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: decreasePage,
                  cond: 'isNotFirstPage',
                },
                'api.refresh': {
                  target: 'loading',
                },
              },
            },
            error: {
              tags: 'error',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
                'api.refresh': {
                  target: 'loading',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: decreasePage,
                  cond: 'isNotFirstPage',
                },
              },
            },
            loading: {
              tags: ['loading'],
              entry: [model.actions.notifyLoading(), fetch],
              on: {
                'api.query': {
                  target: 'loading',
                  actions: query,
                },
                'api.setResponse': {
                  target: 'success',
                  actions: [setResponse, model.actions.notifySuccess()],
                },
                'api.setError': {
                  target: 'error',
                  actions: [setError, model.actions.notifyError()],
                },
              },
            },
          },
          on: {
            '*': {
              actions: 'forwardUnknownEventsToParent',
            },
          },
        },
        polling: {
          entry: fetch,
          on: {
            'api.setResponse': {
              actions: [setResponse, model.actions.notifySuccess()],
            },
          },
          after: {
            INTERVAL: {
              cond: 'isPollingEnabled',
              target: 'polling',
            },
          },
        },
      },
    },
    {
      delays: {
        INTERVAL: 5000,
      },
      actions: {
        notifyReady: sendParent({
          type: 'api.ready',
        }),
        notifySuccess: sendParent((context) => ({
          type: 'api.success',
          ...context.response,
        })),
        notifyError: sendParent((context) => ({
          type: 'api.error',
          error: context.response?.error,
        })),
        notifyLoading: sendParent((context) => ({
          type: 'api.loading',
          ...context.request,
        })),
        forwardUnknownEventsToParent: pure((_context, event) => {
          if (Object.keys(model.events).includes(event.type) === false) {
            return sendParent((_context, _event, meta) => {
              return meta._event.data;
            });
          }
          return [];
        }),
      },
      guards: {
        isNotFirstPage: (context) =>
          context.response !== undefined && context.request.page > 1,
        isNotLastPage: (context) =>
          context.response !== undefined &&
          context.request.size > 0 &&
          context.request.page <
            Math.ceil(context.response.total / context.request.size),
        isTotalZero: (context) => context.response?.total === 0,
        isQuerySuccesful: (context) =>
          context.request.search !== undefined &&
          context.response !== undefined &&
          context.response?.total > 0,
        isQueryEmpty: (context) =>
          context.request.search !== undefined &&
          context.response !== undefined &&
          context.response?.total === 0,
        isPollingEnabled: (context) => context.pollingEnabled,
      },
    }
  );
}

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function/64919133#64919133
class Wrapper<RawDataType, OrderBy, Search, DataType> {
  wrapped(
    service: PaginatedApiCallback<RawDataType, OrderBy, Search>,
    dataTransformer: (response: RawDataType) => DataType
  ) {
    return makePaginatedApiMachine<RawDataType, OrderBy, Search, DataType>(
      service,
      dataTransformer
    );
  }
}

export type PaginatedApiActorType<RawDataType, OrderBy, Search, DataType> =
  ActorRefFrom<
    ReturnType<Wrapper<RawDataType, OrderBy, Search, DataType>['wrapped']>
  >;

// These are not _writable_ booleans, they are derived from the machine state!
// https://discord.com/channels/795785288994652170/799416943324823592/847466843290730527
export type usePaginationReturnValue<OrderBy, Search, DataType> = {
  request: PaginatedApiRequest<OrderBy, Search>;
  response?: PaginatedApiResponse<DataType>;
  loading: boolean;
  queryEmpty: boolean;
  queryResults: boolean;
  noResults: boolean;
  results: boolean;
  error: boolean;
  firstRequest: boolean;
};
export const usePagination = <RawDataType, OrderBy, Search, DataType>(
  actor: PaginatedApiActorType<RawDataType, OrderBy, Search, DataType>
): usePaginationReturnValue<OrderBy, Search, DataType> => {
  return useSelector(
    actor,
    useCallback(
      (
        state: typeof actor.state
      ): usePaginationReturnValue<OrderBy, Search, DataType> => {
        return {
          request: state.context.request,
          response: state.context.response,
          loading: state.hasTag('loading'),
          queryEmpty: state.hasTag('queryEmpty'),
          queryResults: state.hasTag('queryResults'),
          noResults:
            !state.hasTag('loading') &&
            state.context.response?.items?.length === 0,
          results: state.hasTag('results'),
          error: state.hasTag('error'),
          firstRequest: state.context.response === undefined,
        };
      },
      [actor]
    )
  );
};
