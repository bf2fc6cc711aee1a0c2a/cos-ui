import { UserProvidedServiceAccount } from '@apis/api';
import { CORE_CONFIGURATION } from '@constants/constants';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

type Context = {
  name: string;
  sACreated: boolean;
  sAConfiguredConfirmed: boolean;
  userServiceAccount?: UserProvidedServiceAccount;
  duplicateMode?: boolean | undefined;
};

const model = createModel(
  {
    name: '',
    sACreated: false,
    sAConfiguredConfirmed: false,
    userServiceAccount: { clientId: '', clientSecret: '' },
  } as Context,
  {
    events: {
      setName: (payload: { name: string }) => payload,
      setSaCreated: (payload: { sACreated: boolean }) => payload,
      setSaConfiguredConfirmed: (payload: { sAConfiguredConfirmed: boolean }) =>
        payload,
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

const setSaConfiguredConfirmed = model.assign(
  {
    sAConfiguredConfirmed: (_, event) => event.sAConfiguredConfirmed,
  },
  'setSaConfiguredConfirmed'
);

const setServiceAccount = model.assign(
  (_, event) => ({
    userServiceAccount: event.serviceAccount,
  }),
  'setServiceAccount'
);

export const coreConfigurationMachine = model.createMachine(
  {
    id: 'coreConfiguration',
    initial: 'verify',
    predictableActionArguments: true,
    states: {
      verify: {
        entry: sendParent((context) => ({
          type: 'isInvalid',
          data: {
            updatedValue: context.userServiceAccount,
            updatedStep: CORE_CONFIGURATION,
            name: context.name,
          },
        })),
        always: [
          { target: 'valid', cond: 'isCoreConfigurationConfigured' },
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
          setSaConfiguredConfirmed: {
            target: 'verify',
            actions: setSaConfiguredConfirmed,
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
          setSaConfiguredConfirmed: {
            target: 'verify',
            actions: setSaConfiguredConfirmed,
          },
          setServiceAccount: {
            target: 'verify',
            actions: setServiceAccount,
          },
          confirm: {
            target: '#done',
            cond: 'isCoreConfigurationConfigured',
          },
        },
      },
      done: {
        id: 'done',
        type: 'final',
        data: {
          name: (context: Context) => context.name,
          sACreated: (context: Context) => context.sACreated,
          sAConfiguredConfirmed: (context: Context) =>
            context.sAConfiguredConfirmed,
          userServiceAccount: (context: Context) => context.userServiceAccount,
          duplicateMode: (context: Context) => context.duplicateMode,
        },
      },
    },
  },
  {
    guards: {
      isCoreConfigurationConfigured: (context) => {
        const { name, userServiceAccount, sAConfiguredConfirmed } = context;
        return (
          name !== undefined &&
          name.length > 0 &&
          userServiceAccount !== undefined &&
          userServiceAccount.clientId.length > 0 &&
          userServiceAccount.clientSecret.length > 0 &&
          sAConfiguredConfirmed
        );
      },
    },
  }
);

export type CoreConfigurationActorRef = ActorRefFrom<
  typeof coreConfigurationMachine
>;
