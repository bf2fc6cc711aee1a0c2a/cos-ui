import { UserProvidedServiceAccount } from '@apis/api';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

export enum Approach {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

type Context = {
  name: string;
  approach: string;
  userServiceAccount: UserProvidedServiceAccount;
};

const model = createModel(
  {
    name: '',
    approach: '',
    userServiceAccount: { clientId: '', clientSecret: '' },
  } as Context,
  {
    events: {
      setName: (payload: { name: string }) => payload,
      setApproach: (payload: { approach: string }) => payload,
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
const setApproach = model.assign(
  {
    approach: (_, event) => event.approach,
  },
  'setApproach'
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
          setApproach: {
            target: 'verify',
            actions: setApproach,
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
          setApproach: {
            target: 'verify',
            actions: setApproach,
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
          approach: (context: Context) => context.approach,
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
