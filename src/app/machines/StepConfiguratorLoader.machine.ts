import { ComponentType } from 'react';

import { assign, createSchema } from 'xstate';
import { escalate } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

import { ConnectorType } from '@rhoas/connector-management-sdk';

export enum ConfigurationMode {
  CREATE = 'create',
  VIEW = 'view',
  EDIT = 'edit',
  DUPLICATE = 'duplicate',
}

export type ConnectorConfiguratorProps = {
  activeStep?: number;
  connector: ConnectorType;
  uiPath: ConfigurationMode;
  configuration?: unknown;
  onChange: (configuration: Map<string, unknown>, isValid: boolean) => void;
  duplicateMode?: boolean | undefined;
};

export type ConnectorConfiguratorComponent =
  ComponentType<ConnectorConfiguratorProps>;
export type ConnectorConfiguratorType = ConnectorConfiguratorComponent | false;

export type ConnectorConfiguratorResponse = {
  Configurator: ConnectorConfiguratorType;
  steps: string[] | false;
};

type Context = {
  connector: ConnectorType;
  Configurator?: ConnectorConfiguratorType;
  steps?: string[] | false;
  error?: string;
  duplicateMode?: boolean | undefined;
};

const configuratorLoaderMachineSchema = {
  context: createSchema<Context>(),
};

const configuratorLoaderMachineModel = createModel({
  connector: { id: 'something', name: 'something', version: '0.1' },
  Configurator: undefined,
  steps: undefined,
  error: undefined,
  duplicateMode: undefined,
} as Context);

export const configuratorLoaderMachine =
  configuratorLoaderMachineModel.createMachine({
    schema: configuratorLoaderMachineSchema,
    id: 'configurator',
    initial: 'loading',
    context: configuratorLoaderMachineModel.initialContext,
    states: {
      loading: {
        invoke: {
          id: 'fetchConfigurator',
          src: 'fetchConfigurator',
          onDone: {
            target: 'success',
            actions: assign((_context, event) => event.data),
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
        entry: escalate((context) => ({ message: context.error })),
      },
      success: {
        type: 'final',
        data: ({ Configurator, steps }: Context) => ({
          Configurator: Configurator!,
          steps: steps as string[] | false,
        }),
      },
    },
  });
