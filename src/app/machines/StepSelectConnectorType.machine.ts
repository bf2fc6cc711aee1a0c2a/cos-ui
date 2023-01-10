import { SELECT_CONNECTOR_TYPE } from '@constants/constants';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { ConnectorType } from '@rhoas/connector-management-sdk';

type Context = {
  selectedConnector?: ConnectorType;
  duplicateMode?: boolean | undefined;
};

const model = createModel(
  {
    selectedConnector: undefined,
  } as Context,
  {
    events: {
      selectConnector: (payload: { connector: ConnectorType }) => ({
        ...payload,
      }),
      deselectConnector: () => ({}),
      confirm: () => ({}),
    },
  }
);

const selectConnector = model.assign(
  {
    selectedConnector: (_, { connector }) => connector,
  },
  'selectConnector'
);
const deselectConnector = model.assign(
  {
    selectedConnector: undefined,
  },
  'deselectConnector'
);

export const selectConnectorTypeMachine = model.createMachine(
  {
    context: model.initialContext,
    id: 'selectConnectorType',
    predictableActionArguments: true,
    initial: 'root',
    states: {
      root: {
        initial: 'selection',
        states: {
          selection: {
            id: 'selection',
            initial: 'verify',
            states: {
              verify: {
                always: [
                  { target: 'selecting', cond: 'noConnectorSelected' },
                  { target: 'valid', cond: 'connectorSelected' },
                ],
              },
              selecting: {
                entry: sendParent('isInvalid'),
                on: {
                  selectConnector: {
                    target: 'valid',
                    actions: selectConnector,
                    cond: (_, event) => event.connector !== undefined,
                  },
                },
              },
              valid: {
                entry: sendParent((context) => ({
                  type: 'isValid',
                  data: {
                    updatedValue: context.selectedConnector,
                    updatedStep: SELECT_CONNECTOR_TYPE,
                    connectorTypeDetails: context.selectedConnector,
                  },
                })),
                on: {
                  selectConnector: {
                    target: 'verify',
                    actions: selectConnector,
                  },
                  deselectConnector: {
                    target: 'verify',
                    actions: deselectConnector,
                  },
                  confirm: {
                    target: '#done',
                    cond: 'connectorSelected',
                  },
                },
              },
            },
          },
        },
      },
      done: {
        id: 'done',
        type: 'final',
        data: {
          connectorId: (context: Context) => context.selectedConnector!.id,
          selectedConnector: (context: Context) => context.selectedConnector,
          duplicateMode: (context: Context) => context.duplicateMode,
          connectorTypeDetails: (context: Context) => context.selectedConnector,
        },
      },
    },
  },
  {
    guards: {
      connectorSelected: (context) => context.selectedConnector !== undefined,
      noConnectorSelected: (context) => context.selectedConnector === undefined,
    },
  }
);

export type ConnectorTypesMachineActorRef = ActorRefFrom<
  typeof selectConnectorTypeMachine
>;
