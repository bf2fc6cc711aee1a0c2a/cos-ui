import { Machine, assign, sendParent } from 'xstate';

const fetchKafkaInstances = (_authToken?: string) =>
  new Promise(resolve =>
    setTimeout(() => resolve([{ id: 1, name: 'test' }]), 1000)
  );

type KafkaInstancesContext = {
  authToken?: string;
  instances?: { id: number; name: string }[];
  selectedInstance?: number;
  error?: Object;
};

export const kafkaInstancesMachine = Machine<KafkaInstancesContext>({
  id: 'kafka-instances',
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        id: 'fetchKafkaInstances',
        src: context => fetchKafkaInstances(context.authToken),
        onDone: {
          target: 'ready',
          actions: assign({ instances: (_context, event) => event.data }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: (_context, event) => event.data }),
        },
      },
    },
    failure: {},
    ready: {
      on: {
        selectInstance: {
          target: 'ready',
          actions: [
            assign({
              selectedInstance: (context, event) => {
                return context.instances?.find(i => i.id == event.data)?.id;
              },
            }),
            sendParent((context) => ({
              type: "selectedKafkaInstance",
              selectedInstance: context.selectedInstance
            })),
          ],
        },
      },
    }
  }
});
