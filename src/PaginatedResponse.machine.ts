import { useCallback } from 'react';

import { useSelector } from '@xstate/react';
import {
  ActorRef,
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  Sender,
  spawn,
} from 'xstate';
import { pure, send, sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

export type ApiErrorResponse = { page: number; error: string };
export type ApiSuccessResponse<RawDataType> = {
  items: Array<RawDataType>;
  page: number;
  size: number;
  total: number;
};
export type ApiCallback<RawDataType, QueryType> = (
  request: PaginatedApiRequest<QueryType>,
  onSuccess: (payload: ApiSuccessResponse<RawDataType>) => void,
  onError: (payload: ApiErrorResponse) => void
) => () => void;

export type PaginatedApiRequest<QueryType> = {
  page: number;
  size: number;
  query?: QueryType;
};
export type PaginatedApiResponse<DataType> = {
  total: number;
  items?: Array<DataType>;
  error?: string;
};
export type PaginatedMachineContext<RawDataType, QueryType, DataType> = {
  request: PaginatedApiRequest<QueryType>;
  response?: PaginatedApiResponse<DataType>;
  pollingEnabled: boolean;
  actor?: ActorRef<any>;
  dataTransformer: (response: RawDataType) => DataType;
  onBeforeSetResponse?: (previousData: DataType[] | undefined) => void;
};

const paginatedApiMachineSchema = {
  context: createSchema<PaginatedMachineContext<any, any, any>>(),
};

export const getPaginatedApiMachineEvents = <
  RawDataType,
  QueryType,
  DataType
>() => ({
  'api.refresh': () => ({}),
  'api.nextPage': () => ({}),
  'api.prevPage': () => ({}),
  'api.query': (payload: PaginatedApiRequest<QueryType>) => payload,
  'api.setResponse': (payload: ApiSuccessResponse<RawDataType>) => payload,
  'api.setError': (payload: ApiErrorResponse) => payload,

  // notifyParent
  'api.ready': () => ({}),
  'api.loading': (payload: PaginatedApiRequest<QueryType>) => payload,
  'api.success': (payload: ApiSuccessResponse<DataType>) => payload,
  'api.error': (payload: { error: string }) => payload,
});

export const getPaginatedApiMachineEventsHandlers = (to: string) => ({
  'api.refresh': { actions: send((_, e) => e, { to }) },
  'api.nextPage': { actions: send((_, e) => e, { to }) },
  'api.prevPage': { actions: send((_, e) => e, { to }) },
  'api.query': { actions: send((_, e) => e, { to }) },
});

export function makePaginatedApiMachine<RawDataType, QueryType, DataType>(
  service: ApiCallback<RawDataType, QueryType>,
  dataTransformer: (response: RawDataType) => DataType,
  options?: {
    pollingEnabled?: boolean;
    onBeforeSetResponse?: (previousResponse: DataType[] | undefined) => void;
  }
) {
  const paginatedApiMachineModel = createModel(
    {
      request: {
        page: 1,
        size: 10,
      },
      response: undefined,
      pollingEnabled: options?.pollingEnabled || false,
      onBeforeSetResponse: options?.onBeforeSetResponse,
      dataTransformer,
    } as PaginatedMachineContext<RawDataType, QueryType, DataType>,
    {
      events: {
        ...getPaginatedApiMachineEvents<RawDataType, QueryType, DataType>(),
      },
    }
  );

  const callApi =
    (context: PaginatedMachineContext<RawDataType, QueryType, DataType>) =>
    (callback: Sender<any>) => {
      return service(
        context.request!,
        (payload: ApiSuccessResponse<RawDataType>) =>
          callback(paginatedApiMachineModel.events['api.setResponse'](payload)),
        (payload: ApiErrorResponse) =>
          callback(paginatedApiMachineModel.events['api.setError'](payload))
      );
    };

  return createMachine<typeof paginatedApiMachineModel>(
    {
      schema: paginatedApiMachineSchema,
      id: 'paginatedApiMachine',
      context: paginatedApiMachineModel.initialContext,
      type: 'parallel',
      states: {
        api: {
          initial: 'idle',
          states: {
            idle: {
              entry: 'notifyReady',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: 'query',
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
                  actions: 'query',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: 'decreasePage',
                  cond: 'isNotFirstPage',
                },
                'api.refresh': {
                  target: 'loading',
                  actions: 'fetch',
                },
              },
            },
            queryResults: {
              tags: 'queryResults',
              on: {
                'api.query': {
                  target: 'loading',
                  actions: 'query',
                },
                'api.nextPage': {
                  target: 'loading',
                  actions: 'increasePage',
                  cond: 'isNotLastPage',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: 'decreasePage',
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
                  actions: 'query',
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
                  actions: 'query',
                },
                'api.nextPage': {
                  target: 'loading',
                  actions: 'increasePage',
                  cond: 'isNotLastPage',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: 'decreasePage',
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
                  actions: 'query',
                },
                'api.refresh': {
                  target: 'loading',
                },
                'api.prevPage': {
                  target: 'loading',
                  actions: 'decreasePage',
                  cond: 'isNotFirstPage',
                },
              },
            },
            loading: {
              tags: ['loading'],
              entry: ['notifyLoading', 'fetch'],
              on: {
                'api.query': {
                  target: 'loading',
                  actions: 'query',
                },
                'api.setResponse': {
                  target: 'success',
                  actions: ['setResponse', 'notifySuccess'],
                },
                'api.setError': {
                  target: 'error',
                  actions: ['setError', 'notifyError'],
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
          entry: 'fetch',
          on: {
            'api.setResponse': {
              actions: 'setResponse',
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
        fetch: assign((context) => {
          if (context.actor && context.actor.stop) {
            context.actor.stop();
          }
          const actor = spawn(callApi(context));
          return { actor };
        }),
        setResponse: assign((context, e) => {
          if (e.type !== 'api.setResponse' || e.page !== context.request.page)
            return {};
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
        }),
        setError: assign((context, e) => {
          if (e.type !== 'api.setError' || e.page !== context.request.page)
            return {};
          return {
            response: {
              items: context.response?.items || [],
              total: context.response?.total || 0,
              error: e.error,
            },
          };
        }),
        increasePage: assign((context) => {
          return {
            request: {
              ...context.request,
              page: context.request.page + 1,
            },
          };
        }),
        decreasePage: assign((context) => {
          return {
            request: { ...context.request, page: context.request.page - 1 },
          };
        }),
        query: assign((context, event) => {
          if (event.type !== 'api.query') return {};
          const { page, size, query } = event;
          return {
            request: {
              page: page || context.request.page,
              size: size || context.request.size,
              query,
            },
          };
        }),
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
          if (
            Object.keys(paginatedApiMachineModel.events).includes(
              event.type
            ) === false
          ) {
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
          context.request.query !== undefined &&
          context.response !== undefined &&
          context.response?.total > 0,
        isQueryEmpty: (context) =>
          context.request.query !== undefined &&
          context.response !== undefined &&
          context.response?.total === 0,
        isPollingEnabled: (context) => context.pollingEnabled,
      },
    }
  );
}

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function/64919133#64919133
class Wrapper<RawDataType, QueryType, DataType> {
  wrapped(
    service: ApiCallback<RawDataType, QueryType>,
    dataTransformer: (response: RawDataType) => DataType
  ) {
    return makePaginatedApiMachine<RawDataType, QueryType, DataType>(
      service,
      dataTransformer
    );
  }
}

export type PaginatedApiActorType<RawDataType, QueryType, DataType> =
  ActorRefFrom<
    ReturnType<Wrapper<RawDataType, QueryType, DataType>['wrapped']>
  >;

// These are not _writable_ booleans, they are derived from the machine state!
// https://discord.com/channels/795785288994652170/799416943324823592/847466843290730527
export type usePaginationReturnValue<QueryType, DataType> = {
  request: PaginatedApiRequest<QueryType>;
  response?: PaginatedApiResponse<DataType>;
  loading: boolean;
  queryEmpty: boolean;
  queryResults: boolean;
  noResults: boolean;
  results: boolean;
  error: boolean;
  firstRequest: boolean;
};
export const usePagination = <RawDataType, QueryType, DataType>(
  actor: PaginatedApiActorType<RawDataType, QueryType, DataType>
): usePaginationReturnValue<QueryType, DataType> => {
  return useSelector(
    actor,
    useCallback(
      (
        state: typeof actor.state
      ): usePaginationReturnValue<QueryType, DataType> => {
        return {
          request: state.context.request,
          response: state.context.response,
          loading: state.hasTag('loading'),
          queryEmpty: state.hasTag('queryEmpty'),
          queryResults: state.hasTag('queryResults'),
          noResults: state.hasTag('empty'),
          results: state.hasTag('results'),
          error: state.hasTag('error'),
          firstRequest: state.context.response === undefined,
        };
      },
      [actor]
    )
  );
};
