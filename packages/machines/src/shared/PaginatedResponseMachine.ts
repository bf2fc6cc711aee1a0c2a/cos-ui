import { useSelector } from '@xstate/react';
import { useCallback } from 'react';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  Sender,
  spawn,
  SpawnedActorRef,
} from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

export type ApiErrorResponse = { page: number; error: string };
export type ApiSuccessResponse<ResponseType> = {
  items: Array<ResponseType>;
  page: number;
  size: number;
  total: number;
};
export type ApiCallback<ResponseType, QueryType> = (
  request: PaginatedApiRequest<QueryType>,
  onSuccess: (payload: ApiSuccessResponse<ResponseType>) => void,
  onError: (payload: ApiErrorResponse) => void
) => () => void;

export type PaginatedApiRequest<QueryType> = {
  page: number;
  size: number;
  query?: QueryType;
};
export type PaginatedApiResponse<ResponseType> = {
  total: number;
  items?: Array<ResponseType>;
  error?: string;
};
export type PaginatedMachineContext<ResponseType, QueryType> = {
  request: PaginatedApiRequest<QueryType>;
  response?: PaginatedApiResponse<ResponseType>;
  actor?: SpawnedActorRef<any>;
};

const paginatedApiMachineSchema = {
  context: createSchema<PaginatedMachineContext<any, {}>>(),
};

export const paginatedApiMachineEvents = {
  refresh: () => ({}),
  nextPage: () => ({}),
  prevPage: () => ({}),
  query: (payload: PaginatedApiRequest<{}>) => payload,
  setResponse: (payload: ApiSuccessResponse<unknown>) => payload,
  setError: (payload: ApiErrorResponse) => payload,
};

export const paginatedApiMachineModel = createModel(
  {
    request: {
      page: 1,
      size: 10,
    },
    response: undefined,
  } as PaginatedMachineContext<any, any>,
  {
    events: {
      ...paginatedApiMachineEvents,
    },
  }
);

export function makePaginatedApiMachine<ResponseType, QueryType>(
  service: ApiCallback<ResponseType, QueryType>
) {
  const callApi = (
    context: PaginatedMachineContext<ResponseType, QueryType>
  ) => (callback: Sender<any>) => {
    return service(
      context.request!,
      (payload: ApiSuccessResponse<ResponseType>) =>
        callback(paginatedApiMachineModel.events.setResponse(payload)),
      (payload: ApiErrorResponse) =>
        callback(paginatedApiMachineModel.events.setError(payload))
    );
  };

  return createMachine<typeof paginatedApiMachineModel>(
    {
      schema: paginatedApiMachineSchema,
      id: 'paginatedApiMachine',
      context: paginatedApiMachineModel.initialContext,
      initial: 'idle',
      states: {
        idle: {
          entry: 'notifyReady',
          on: {
            query: {
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
            query: {
              target: 'loading',
              actions: 'query',
            },
            prevPage: {
              target: 'loading',
              actions: 'decreasePage',
              cond: 'isNotFirstPage',
            },
            refresh: {
              target: 'loading',
              actions: 'fetch',
            },
          },
        },
        queryResults: {
          tags: 'queryResults',
          on: {
            query: {
              target: 'loading',
              actions: 'query',
            },
            nextPage: {
              target: 'loading',
              actions: 'increasePage',
              cond: 'isNotLastPage',
            },
            prevPage: {
              target: 'loading',
              actions: 'decreasePage',
              cond: 'isNotFirstPage',
            },
            refresh: {
              target: 'loading',
              actions: 'fetch',
            },
          },
        },
        empty: {
          tags: 'empty',
          on: {
            query: {
              target: 'loading',
              actions: 'query',
            },
            refresh: {
              target: 'loading',
              actions: 'fetch',
            },
          },
        },
        results: {
          tags: 'results',
          on: {
            query: {
              target: 'loading',
              actions: 'query',
            },
            nextPage: {
              target: 'loading',
              actions: 'increasePage',
              cond: 'isNotLastPage',
            },
            prevPage: {
              target: 'loading',
              actions: 'decreasePage',
              cond: 'isNotFirstPage',
            },
            refresh: {
              target: 'loading',
              actions: 'fetch',
            },
          },
        },
        error: {
          tags: 'error',
          on: {
            query: {
              target: 'loading',
              actions: 'query',
            },
            refresh: {
              target: 'loading',
              actions: 'fetch',
            },
            prevPage: {
              target: 'loading',
              actions: 'decreasePage',
              cond: 'isNotFirstPage',
            },
          },
        },
        loading: {
          entry: ['notifyLoading', 'fetch'],
          on: {
            query: {
              target: 'loading',
              actions: 'query',
            },
            setResponse: {
              target: 'success',
              actions: ['setResponse', 'notifySuccess'],
            },
            setError: {
              target: 'error',
              actions: ['setError', 'notifyError'],
            },
          },
        },
      },
    },
    {
      actions: {
        fetch: assign(context => {
          if (context.actor && context.actor.stop) {
            context.actor.stop();
          }
          const actor = spawn(callApi(context));
          return { actor };
        }),
        setResponse: assign((context, e) => {
          if (e.type !== 'setResponse' || e.page !== context.request.page)
            return {};
          return {
            response: {
              items: e.items,
              total: e.total,
              error: undefined,
            },
          };
        }),
        setError: assign((context, e) => {
          if (e.type !== 'setError' || e.page !== context.request.page)
            return {};
          return {
            response: {
              items: undefined,
              total: context.response?.total || 0,
              error: e.error,
            },
          };
        }),
        increasePage: assign(context => {
          return {
            request: {
              ...context.request,
              page: context.request.page + 1,
            },
          };
        }),
        decreasePage: assign(context => {
          return {
            request: { ...context.request, page: context.request.page - 1 },
          };
        }),
        query: assign((context, event) => {
          if (event.type !== 'query') return {};
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
          type: 'ready',
        }),
        notifySuccess: sendParent(context => ({
          type: 'success',
          ...context.response,
        })),
        notifyError: sendParent(context => ({
          type: 'error',
          error: context.response?.error,
        })),
        notifyLoading: sendParent(context => ({
          type: 'loading',
          ...context.request,
        })),
      },
      guards: {
        isNotFirstPage: context =>
          context.response !== undefined && context.request.page > 1,
        isNotLastPage: context =>
          context.response !== undefined &&
          context.request.size > 0 &&
          context.request.page <
            Math.ceil(context.response.total / context.request.size),
        isTotalZero: context => context.response?.total === 0,
        isQuerySuccesful: context =>
          context.request.query !== undefined &&
          context.response !== undefined &&
          context.response?.total > 0,
        isQueryEmpty: context =>
          context.request.query !== undefined &&
          context.response !== undefined &&
          context.response?.total === 0,
      },
    }
  );
}

export type PaginatedApiActorType = ActorRefFrom<
  ReturnType<typeof makePaginatedApiMachine>
>;

export const usePagination = <ResponseType, QueryType>(
  actor: PaginatedApiActorType
) => {
  return useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => {
        return {
          request: state.context.request as PaginatedApiRequest<QueryType>,
          response: state.context.response as
            | PaginatedApiResponse<ResponseType>
            | undefined,
          loading: state.matches('loading'),
          queryEmpty: state.hasTag('queryEmpty'),
          queryResults: state.hasTag('queryResults'),
          noResults: state.hasTag('empty'),
          results: state.hasTag('results'),
          error: state.hasTag('error'),
          firstRequest: state.matches('idle'),
        };
      },
      [actor]
    )
  );
};
