import { assign, createSchema } from 'xstate';
import { createModel } from 'xstate/lib/model';

type Context<T> = {
  data?: T;
  error?: string;
};

export function makeFetchMachine<T>() {
  const fetchMachineSchema = {
    context: createSchema<Context<T>>(),
  };

  const fetchMachineModel = createModel({
    data: undefined,
    error: undefined,
  } as Context<T>);

  return fetchMachineModel.createMachine({
    schema: fetchMachineSchema,
    id: 'fetchMachine',
    predictableActionArguments: true,
    context: {},
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchService',
          src: 'fetchService',
          onDone: {
            target: 'success',
            actions: assign((_context, event) => ({
              data: event.data,
            })),
          },
          onError: {
            target: 'failure',
            actions: assign({
              error: (_context, event) => event.data,
            }),
          },
        },
      },
      failure: {
        type: 'final',
      },
      success: {
        type: 'final',
        data: ({ data }: Context<T>) => ({ ...data }),
      },
    },
  });
}
