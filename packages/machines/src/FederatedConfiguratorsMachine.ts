import { ConnectorType } from '@kas-connectors/api';
import { assign, createMachine, createSchema } from 'xstate';
import { createModel } from 'xstate/lib/model';

type ConfiguratorType = { remoteEntry: string; scope: string; module: string };

type Context = {
  configUrl: string;
  connector: ConnectorType;
  configurator?: ConfiguratorType;
  error?: string;
};

const federatedConfiguratorsMachineSchema = {
  context: createSchema<Context>(),
};

const federatedConfiguratorsMachineModel = createModel({
  configUrl: 'http://localhost/federated-configurators.json',
  connector: { name: 'test', version: 'test' },
  configurator: undefined,
  error: undefined,
} as Context);

export const federatedConfiguratorsMachine = createMachine<
  typeof federatedConfiguratorsMachineModel
>(
  {
    schema: federatedConfiguratorsMachineSchema,
    id: 'configurator',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchConfigurators',
          src: 'fetchConfigurators',
          onDone: {
            target: 'success',
            actions: assign((_context, event) => ({
              configurator: event.data,
            })),
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
        type: 'final',
      },
      success: {
        type: 'final',
        data: ({ configurator }: Context) => ({ ...configurator }),
      },
    },
  },
  {
    services: {
      fetchConfigurators: async ({
        configUrl,
        connector,
      }): Promise<ConfiguratorType> => {
        const config = await (await fetch(configUrl)).json();
        console.log(
          'Fetched federated configurator remotes configuration',
          config
        );
        const maybeConfiguration = config[connector.id!];
        console.log(
          `Candidate configuration for "${connector.id}"`,
          maybeConfiguration
        );
        if (!maybeConfiguration) {
          console.log(
            "Couldn't find any configuration for the requested connector"
          );
          return Promise.reject();
        }
        if (isValidConf(maybeConfiguration[connector.version])) {
          const conf = maybeConfiguration[connector.version];
          console.log(
            `Found a configuration for connector version "${connector.version}"`,
            conf
          );
          return conf;
        }
        if (isValidConf(maybeConfiguration)) {
          console.log(
            'Found a generic configuration for the connector',
            maybeConfiguration
          );
          return maybeConfiguration;
        }
        console.log(
          "Couldn't find a valid configuration for the requested connector"
        );
        return Promise.reject();
      },
    },
  }
);

const isValidConf = (maybeConf?: any) =>
  maybeConf &&
  maybeConf.remoteEntry &&
  typeof maybeConf.remoteEntry === 'string' &&
  maybeConf.scope &&
  typeof maybeConf.scope === 'string' &&
  maybeConf.module &&
  typeof maybeConf.module === 'string';
