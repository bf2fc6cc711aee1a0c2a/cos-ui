import {
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
export type ApiSuccessResponse<T> = {
  items: Array<T>;
  page: number;
  size: number;
  total: number;
};
export type ApiCallback<T> = (
  request: PaginatedApiRequest,
  onSuccess: (payload: ApiSuccessResponse<T>) => void,
  onError: (payload: ApiErrorResponse) => void
) => () => void;

export type PaginatedApiRequest = {
  page: number;
  size: number;
  [key: string]: unknown;
};
export type PaginatedApiResponse<T> = {
  total: number;
  items?: Array<T>;
  error?: string;
};
export type PaginatedMachineContext<T> = {
  request: PaginatedApiRequest;
  response?: PaginatedApiResponse<T>;
  actor?: SpawnedActorRef<any>;
};

const paginatedApiMachineSchema = {
  context: createSchema<PaginatedMachineContext<any>>(),
};

export const paginatedApiMachineEvents = {
  refresh: () => ({}),
  nextPage: () => ({}),
  prevPage: () => ({}),
  query: (payload: PaginatedApiRequest) => payload,
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
  } as PaginatedMachineContext<any>,
  {
    events: {
      ...paginatedApiMachineEvents,
    },
  }
);

export function makePaginatedApiMachine<T>(service: ApiCallback<T>) {
  const callApi = (context: PaginatedMachineContext<T>) => (
    callback: Sender<any>
  ) => {
    return service(
      context.request!,
      (payload: ApiSuccessResponse<T>) =>
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
        loading: {
          entry: ['notifyLoading', 'fetch'],
        },
        idle: {},
      },
      on: {
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
        query: {
          target: 'loading',
          actions: 'query',
        },
        setResponse: {
          target: 'idle',
          actions: ['setResponse', 'notifySuccess'],
        },
        setError: {
          target: 'idle',
          actions: ['setError', 'notifyError'],
        },
        refresh: {
          target: 'loading',
          actions: 'fetch',
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
        query: assign((_context, event) => {
          if (event.type !== 'query') return {};
          const { type, ...payload } = event;
          return {
            request: payload,
          };
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
      },
    }
  );
}
