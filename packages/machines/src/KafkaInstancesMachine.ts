import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  KafkaRequest,
  KafkaRequestList,
} from '@kas-connectors/api';
import { assign, createMachine, DoneInvokeEvent, sendParent } from 'xstate';
import { escalate } from 'xstate/lib/actions';

const fetchKafkaInstances = (accessToken?: Promise<string>, basePath?: string) => {
  // new Promise(resolve =>
  //   setTimeout(() => resolve([{ id: 1, name: 'test' }]), 1000)
  // );
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

type State =
  | {
      value: 'loading';
      context: Context;
    }
  | {
      value: 'success';
      context: Context & {
        instances: KafkaRequestList;
        error: undefined;
      };
    }
  | {
      value: 'failure';
      context: Context & {
        instances: undefined;
        error: string;
      };
    };

type selectInstanceEvent = {
  type: 'selectInstance';
  selectedInstance: string;
};

type selectedInstanceChangedEvent = {
  type: 'selectedInstanceChange';
  selectedInstance: KafkaRequest;
};

type Event = selectInstanceEvent;

const fetchSuccess = assign<
  Context,
  DoneInvokeEvent<AxiosResponse<KafkaRequestList>>
>({
  instances: (_context, event) => event.data.data,
});
const fetchFailure = assign<Context, DoneInvokeEvent<string>>({
  error: (_context, event) => event.data,
});
const selectInstance = assign<Context, selectInstanceEvent>({
  selectedInstance: (context, event) =>
    context.instances?.items.find(i => i.id == event.selectedInstance),
});
const notifyParent = sendParent<Context, selectInstanceEvent, selectedInstanceChangedEvent>(context => ({
  type: 'selectedInstanceChange',
  selectedInstance: context.selectedInstance!,
}))

export const kafkaInstancesMachine = createMachine<Context, Event, State>(
  {
    id: 'kafka-instances',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchKafkaInstances',
          src: context =>
            fetchKafkaInstances(context.authToken, context.basePath),
          onDone: {
            target: 'success',
            actions: fetchSuccess,
          },
          onError: {
            target: 'failure',
            actions: fetchFailure,
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
            actions: [
              'selectInstance',
              'notifyParent',
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      selectInstance,
      notifyParent
    },
  }
);
