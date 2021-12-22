import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { UserProvidedServiceAccount } from './api';

type Context = {
  name: string;
  userServiceAccount?: UserProvidedServiceAccount;
};

const model = createModel(
  {
    name: '',
  } as Context,
  {
    events: {
      setName: (payload: { name: string }) => payload,
      setServiceAccount: (payload: {
        serviceAccount: UserProvidedServiceAccount | undefined;
      }) => payload,
      confirm: () => ({}),
    },
  }
);
const setName = model.assign(
  {
    name: (_, event) => event.name,
  },
  'setName'
);
const setServiceAccount = model.assign(
  (_, event) => ({
    userServiceAccount: event.serviceAccount,
  }),
  'setServiceAccount'
);

export const basicMachine = model.createMachine(
  {
    id: 'configureBasic',
    initial: 'verify',
    states: {
      verify: {
        always: [
          { target: 'valid', cond: 'isBasicConfigured' },
          { target: 'typing' },
        ],
      },
      typing: {
        entry: sendParent('isInvalid'),
        on: {
          setName: {
            target: 'verify',
            actions: setName,
          },
          setServiceAccount: {
            target: 'verify',
            actions: setServiceAccount,
          },
        },
      },
      valid: {
        id: 'valid',
        entry: sendParent('isValid'),
        on: {
          setName: {
            target: 'verify',
            actions: setName,
          },
          setServiceAccount: {
            target: 'verify',
            actions: setServiceAccount,
          },
          confirm: {
            target: '#done',
            cond: 'isBasicConfigured',
          },
        },
      },
      done: {
        id: 'done',
        type: 'final',
        data: {
          name: (context: Context) => context.name,
          userServiceAccount: (context: Context) => context.userServiceAccount,
        },
      },
    },
  },
  {
    guards: {
      isBasicConfigured: (context) =>
        context.userServiceAccount === undefined
          ? context.name !== undefined && context.name.length > 0
          : context.name !== undefined &&
            context.name.length > 0 &&
            context.userServiceAccount.clientId.length > 0 &&
            context.userServiceAccount.clientSecret.length > 0,
    },
  }
);

export type BasicMachineActorRef = ActorRefFrom<typeof basicMachine>;
