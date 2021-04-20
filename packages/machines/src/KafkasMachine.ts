import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  KafkaRequest,
  KafkaRequestList,
} from '@kas-connectors/api';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  DoneInvokeEvent,
} from 'xstate';
import { escalate, sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

const fetchKafkaInstances = (
  accessToken?: Promise<string>,
  basePath?: string
) => {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return apisService.listKafkas();
};

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  instances?: KafkaRequestList;
  selectedInstance?: KafkaRequest;
  error?: Object;
};

const kafkasMachineSchema = {
  context: createSchema<Context>(),
};

const kafkasMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
    instances: undefined,
    selectedInstance: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectInstance: (payload: { selectedInstance: string }) => ({
        ...payload,
      }),
      deselectInstance: () => ({}),
      confirm: () => ({}),
    },
  }
);

export const kafkasMachine = createMachine<typeof kafkasMachineModel>(
  {
    schema: kafkasMachineSchema,
    id: 'kafkas',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchKafkaInstances',
          src: context =>
            fetchKafkaInstances(context.authToken, context.basePath),
          onDone: {
            target: 'verify',
            actions: assign<
              Context,
              DoneInvokeEvent<AxiosResponse<KafkaRequestList>>
            >({
              instances: (_context, event) => event.data.data,
            }),
          },
          onError: {
            target: 'failure',
            actions: assign<Context, DoneInvokeEvent<string>>({
              error: (_context, event) => event.data,
            }),
          },
        },
      },
      failure: {
        entry: escalate(context => ({ message: context.error })),
      },
      verify: {
        always: [
          { target: 'selecting', cond: 'noInstanceSelected' },
          { target: 'valid', cond: 'instanceSelected' },
        ],
      },
      selecting: {
        entry: sendParent('isInvalid'),
        on: {
          selectInstance: {
            target: 'valid',
            actions: 'selectInstance',
          },
        },
      },
      valid: {
        entry: sendParent('isValid'),
        on: {
          selectInstance: {
            target: 'verify',
            actions: 'selectInstance',
            cond: (_, event) => event.selectedInstance !== undefined,
          },
          deselectInstance: {
            target: 'verify',
            actions: 'reset',
          },
          confirm: {
            target: 'done',
            cond: 'instanceSelected',
          },
        },
      },
      done: {
        type: 'final',
        data: {
          selectedInstance: (context: Context) => context.selectedInstance,
        },
      },
    },
  },
  {
    actions: {
      selectInstance: assign({
        selectedInstance: (context, event) => {
          if (event.type === 'selectInstance') {
            return context.instances?.items.find(
              i => i.id === event.selectedInstance
            );
          }
          return context.selectedInstance;
        },
      }),
      reset: assign({
        selectedInstance: (context, event) =>
          event.type === 'deselectInstance'
            ? undefined
            : context.selectedInstance,
      }),
    },
    guards: {
      instanceSelected: context => context.selectedInstance !== undefined,
      noInstanceSelected: context => context.selectedInstance === undefined,
    },
  }
);

export type KafkaMachineActorRef = ActorRefFrom<typeof kafkasMachine>;
