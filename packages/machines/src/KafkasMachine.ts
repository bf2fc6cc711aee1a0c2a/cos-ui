import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  KafkaRequest,
  KafkaRequestList,
} from '@kas-connectors/api';
import {
  assign,
  createMachine,
  createSchema,
  DoneInvokeEvent,
  sendParent,
} from 'xstate';
import { escalate } from 'xstate/lib/actions';
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
      selectedInstanceChanged: (payload: {
        selectedInstance: KafkaRequest;
      }) => ({ ...payload }),
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
            target: 'success',
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
      success: {
        on: {
          selectInstance: {
            target: 'success',
            actions: ['selectInstance', 'notifyParent'],
          },
        },
      },
    },
  },
  {
    actions: {
      selectInstance: assign({
        selectedInstance: (context, event) =>
          context.instances?.items.find(i => i.id == event.selectedInstance),
      }),
      notifyParent: sendParent(context => ({
        type: 'selectedInstanceChange',
        selectedInstance: context.selectedInstance!,
      })),
    },
  }
);
