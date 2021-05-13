import {
  assign,
  createMachine,
  createSchema,
  Sender,
  spawn,
  SpawnedActorRef,
} from 'xstate';
import { createModel } from 'xstate/lib/model';

export type Request = {
  page: number;
  size: number;
  [key: string]: string | number;
};
export type ErrorResponse = { page: number; error: string };
export type SuccessResponse<T> = {
  data: T;
  page: number;
  size: number;
  total: number;
};
export type ApiCallback<T> = (
  request: Request,
  onSuccess: (payload: SuccessResponse<T>) => void,
  onError: (payload: ErrorResponse) => void
) => () => void;

type Context<T> = {
  request: Request;
  total: number;
  data?: T;
  error?: string;
  actor?: SpawnedActorRef<any>;
};

export function makePaginatedApiMachine<T>(service: ApiCallback<T>) {
  const paginatedApiMachineSchema = {
    context: createSchema<Context<T>>(),
  };

  const paginatedApiMachineModel = createModel(
    {
      request: {
        page: 0,
        size: 0,
      },
      total: 0,
      data: undefined,
      error: undefined,
    } as Context<T>,
    {
      events: {
        refresh: () => ({}),
        nextPage: () => ({}),
        prevPage: () => ({}),
        query: (payload: Partial<Request>) => payload,
        updateData: (payload: SuccessResponse<T>) => payload,
        setError: (payload: ErrorResponse) => payload,
      },
    }
  );

  const callApi = (context: Context<T>) => (callback: Sender<any>) => {
    return service(
      context.request,
      (payload: SuccessResponse<T>) =>
        callback(paginatedApiMachineModel.events.updateData(payload)),
      (payload: ErrorResponse) =>
        callback(paginatedApiMachineModel.events.setError(payload))
    );
  };

  return createMachine<typeof paginatedApiMachineModel>(
    {
      schema: paginatedApiMachineSchema,
      id: 'paginatedApiMachine',
      context: {
        request: {
          page: 0,
          size: 0,
        },
        total: 0,
      },
      initial: 'idle',
      states: {
        loading: {},
        idle: {},
      },
      on: {
        nextPage: {
          target: 'loading',
          actions: ['increasePage', 'fetch'],
          cond: 'isNotLastPage',
        },
        prevPage: {
          target: 'loading',
          actions: ['decreasePage', 'fetch'],
          cond: 'isNotFirstPage',
        },
        query: {
          target: 'loading',
          actions: ['query', 'fetch'],
        },
        updateData: {
          target: 'idle',
          actions: 'updateData',
        },
        setError: {
          target: 'idle',
          actions: 'setError',
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
        updateData: assign((context, e) => {
          if (
            e.type !== 'updateData' ||
            e.page !== context.request.page ||
            e.size !== context.request.size
          )
            return {};
          return {
            data: e.data,
            size: e.size,
            total: e.total,
            error: undefined,
          };
        }),
        setError: assign((context, e) => {
          if (e.type !== 'setError' || e.page !== context.request.page)
            return {};
          return {
            data: undefined,
            error: e.error,
          };
        }),
        increasePage: assign(context => {
          return {
            request: { ...context.request, page: context.request.page + 1 },
          };
        }),
        decreasePage: assign(context => {
          return {
            request: { ...context.request, page: context.request.page - 1 },
          };
        }),
        query: assign((context, event) => {
          if (event.type !== 'query') return {};
          const { type, ...payload } = event;
          return {
            request: {
              page: context.request.page,
              size: context.request.size,
              ...payload,
            },
          };
        }),
      },
      guards: {
        isNotFirstPage: context => context.request.page > 1,
        isNotLastPage: context =>
          context.request.size > 0 &&
          context.request.page <
            Math.ceil(context.total / context.request.size),
      },
    }
  );
}
