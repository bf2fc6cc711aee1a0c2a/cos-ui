import { UserProvidedServiceAccount } from '@apis/api';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

type Context = {
  name: string;
  sACreated: boolean;
  userServiceAccount: UserProvidedServiceAccount;
};

const model = createModel(
  {
    name: '',
    sACreated: false,
    userServiceAccount: { clientId: '', clientSecret: '' },
  } as Context,
  {
    events: {
      setName: (payload: { name: string }) => payload,
      setSaCreated: (payload: { sACreated: boolean }) => payload,
      setServiceAccount: (payload: {
        serviceAccount: UserProvidedServiceAccount;
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

const setSaCreated = model.assign(
  {
    sACreated: (_, event) => event.sACreated,
  },
  'setSaCreated'
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
          setSaCreated: {
            target: 'verify',
            actions: setSaCreated,
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
          setSaCreated: {
            target: 'verify',
            actions: setSaCreated,
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
          sACreated: (context: Context) => context.sACreated,
          userServiceAccount: (context: Context) => context.userServiceAccount,
        },
      },
    },
  },
  {
    guards: {
      isBasicConfigured: (context) => {
        return (
          context.name !== undefined &&
          context.name.length > 0 &&
          context.userServiceAccount !== undefined &&
          context.userServiceAccount.clientId.length > 0 &&
          context.userServiceAccount.clientSecret.length > 0
        );
      },
    },
  }
);

export type BasicMachineActorRef = ActorRefFrom<typeof basicMachine>;
