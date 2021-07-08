/* eslint-disable testing-library/await-async-utils */
/* eslint-disable testing-library/await-async-query */
import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
  configure,
  waitForElementToBeRemoved,
} from '@testing-library/react';
// import { assert } from 'chai';
import { createModel } from '@xstate/test';
import { Machine } from 'xstate';
import * as mockApis from './mockApis';
import { CreationWizard, CreationWizardMachineProvider } from '../src';

type TestContext = {
  onClose: () => void;
  onSave: () => void;
};
const testMachine = Machine({
  id: 'test-machine',
  initial: 'loadingConnectors',
  context: {
    willKafkaApiFail: false,
    willClusterApiFail: false,
    willConnectorsApiFail: false,
  },
  states: {
    loadingConnectors: {
      always: [
        {
          target: 'selectConnector',
          cond: ctx => !ctx.willConnectorsApiFail,
        },
        {
          target: 'selectConnectorEmptyState',
          cond: ctx => ctx.willConnectorsApiFail,
        },
      ],
    },
    selectConnector: {
      on: {
        clickConnector: 'loadingKafka',
      },
      meta: {
        test: () =>
          waitFor(() => expect(screen.getByText('telegram-source-source'))),
      },
    },
    selectConnectorEmptyState: {
      meta: {
        noCoverage: true,
        test: () =>
          waitFor(() => expect(screen.getByText('cos.no_connector_types'))),
      },
    },
    loadingKafka: {
      always: [
        { target: 'selectKafka', cond: ctx => !ctx.willKafkaApiFail },
        { target: 'selectKafkaEmptyState', cond: ctx => ctx.willKafkaApiFail },
      ],
    },
    selectKafka: {
      on: {
        clickKafkaInstance: 'loadingClusters',
      },
      meta: {
        test: () => waitFor(() => expect(screen.getByText('badwords'))),
      },
    },
    selectKafkaEmptyState: {
      meta: {
        noCoverage: true,
        test: () =>
          waitFor(() => expect(screen.getByText('cos.no_kafka_instance'))),
      },
    },
    loadingClusters: {
      always: [
        {
          target: 'selectCluster',
          cond: ctx => !ctx.willClusterApiFail,
        },
        {
          target: 'selectClusterEmptyState',
          cond: ctx => ctx.willClusterApiFail,
        },
      ],
    },
    selectCluster: {
      on: {
        clickCluster: 'configureConnector',
      },
      meta: {
        test: () => waitFor(() => expect(screen.getByText('megalord'))),
      },
    },
    selectClusterEmptyState: {
      meta: {
        noCoverage: true,
        test: () =>
          waitFor(() => expect(screen.getByText('cos.no_clusters_instance'))),
      },
    },
    configureConnector: {
      on: {
        configure: 'review',
      },
      meta: {
        test: () => waitFor(() => expect(screen.getByText('Token'))),
      },
    },
    review: {
      on: {
        saveConnector: 'saved',
      },
      meta: {
        test: () =>
          waitFor(() => {
            expect(screen.getByText('Please review the configuration data.'));
            expect(
              screen.getByDisplayValue('{ "authorizationToken": "some-token" }')
            );
          }),
      },
    },
    saved: {
      type: 'final',
      meta: {
        test: async ({ onClose, onSave }: TestContext) => {
          await waitForElementToBeRemoved(() =>
            screen.queryByText('Create connector')
          );

          expect(onClose).toBeCalledTimes(0);
          expect(onSave).toBeCalledTimes(1);
        },
      },
      on: {
        onClose: undefined,
      },
    },
    closed: {
      type: 'final',
      meta: {
        test: ({ onClose, onSave }: TestContext) => {
          expect(onClose).toBeCalledTimes(1);
          expect(onSave).toBeCalledTimes(0);
        },
      },
    },
  },
  on: {
    onClose: 'closed',
  },
});

describe('@cos-ui/creationWizard', () => {
  describe('CreationWizard', () => {
    configure({
      getElementError: (message, container) => {
        // eslint-disable-next-line testing-library/no-node-access
        const wizardBody = container.querySelector('.pf-c-wizard__main-body');
        const newMessage = [message, wizardBody?.textContent]
          .filter(Boolean)
          .join('\n\n');
        return new Error(newMessage);
      },
    });

    describe('Happy path', () => {
      const testModel = createModel(testMachine).withEvents({
        clickOnDisabledNext: () => {
          fireEvent.click(screen.getByText('Next'));
        },
        clickConnector: async () => {
          fireEvent.change(screen.getByLabelText('filter by connector name'), {
            target: { value: 'telegram' },
          });
          const connector = await screen.findByText('telegram-source-source');
          fireEvent.click(connector);
          fireEvent.click(screen.getByText('Next'));
        },
        clickKafkaInstance: () => {
          fireEvent.click(screen.getByText('badwords'));
          fireEvent.click(screen.getByText('Next'));
        },
        clickCluster: () => {
          fireEvent.click(screen.getByText('megalord'));
          fireEvent.click(screen.getByText('Next'));
        },
        configure: async () => {
          fireEvent.change(screen.getByLabelText('Token *'), {
            target: { value: 'some-token' },
          });
          await waitFor(() => expect(screen.getByText('Next')).toBeEnabled());
          fireEvent.click(screen.getByText('Next'));
        },
        saveConnector: async () => {
          fireEvent.change(screen.getByLabelText('Name *'), {
            target: { value: 'my-connector' },
          });
          await waitFor(() =>
            expect(screen.getByText('Create connector')).toBeEnabled()
          );
          fireEvent.click(screen.getByText('Create connector'));
        },
        onClose: () => {
          fireEvent.click(screen.getByText('Cancel'));
        },
      });

      const testPlans = testModel.getSimplePathPlans();
      testPlans.forEach(plan => {
        describe(plan.description, () => {
          beforeEach(mockApis.makeHappyPath);
          afterEach(() => {
            jest.clearAllMocks();
          });
          plan.paths.forEach(path => {
            it(path.description, async () => {
              await act(async () => {
                const onClose = jest.fn();
                const onSave = jest.fn();

                render(
                  <CreationWizardMachineProvider
                    accessToken={() => Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                    onSave={onSave}
                  >
                    <CreationWizard onClose={onClose} />
                  </CreationWizardMachineProvider>
                );
                await path.test({ onClose, onSave });
              });
            });
          });
        });
      });

      it('coverage', () => {
        testModel.testCoverage({
          filter: stateNode =>
            stateNode.meta && stateNode.meta.noCoverage !== true,
        });
      });
    });

    describe('Connectors API error', () => {
      const testModel = createModel(
        testMachine.withContext({
          willKafkaApiFail: false,
          willClusterApiFail: false,
          willConnectorsApiFail: true,
        })
      ).withEvents({
        onClose: () => {
          fireEvent.click(screen.getByText('Cancel'));
        },
      });

      const testPlans = testModel.getSimplePathPlans();
      testPlans.forEach(plan => {
        describe(plan.description, () => {
          beforeEach(mockApis.makeConnectorsError);
          afterEach(() => {
            jest.clearAllMocks();
          });
          plan.paths.forEach(path => {
            it(path.description, async () => {
              await act(async () => {
                const onClose = jest.fn();
                const onSave = jest.fn();

                render(
                  <CreationWizardMachineProvider
                    accessToken={() => Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                    onSave={onSave}
                  >
                    <CreationWizard onClose={onClose} />
                  </CreationWizardMachineProvider>
                );
                await path.test({ onClose, onSave });
              });
            });
          });
        });
      });
    });

    describe('Kafka API error', () => {
      const testModel = createModel(
        testMachine.withContext({
          willKafkaApiFail: true,
          willClusterApiFail: false,
          willConnectorsApiFail: false,
        })
      ).withEvents({
        clickConnector: async () => {
          fireEvent.change(screen.getByLabelText('filter by connector name'), {
            target: { value: 'telegram' },
          });
          const connector = await screen.findByText('telegram-source-source');
          fireEvent.click(connector);

          fireEvent.click(screen.getByText('Next'));
        },
        onClose: () => {
          fireEvent.click(screen.getByText('Cancel'));
        },
      });

      const testPlans = testModel.getSimplePathPlans();
      testPlans.forEach(plan => {
        describe(plan.description, () => {
          beforeEach(mockApis.makeKafkaError);
          afterEach(() => {
            jest.clearAllMocks();
          });
          plan.paths.forEach(path => {
            it(path.description, async () => {
              await act(async () => {
                const onClose = jest.fn();
                const onSave = jest.fn();

                render(
                  <CreationWizardMachineProvider
                    accessToken={() => Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                    onSave={onSave}
                  >
                    <CreationWizard onClose={onClose} />
                  </CreationWizardMachineProvider>
                );
                await path.test({ onClose, onSave });
              });
            });
          });
        });
      });
    });

    describe('Clusters API error', () => {
      const testModel = createModel(
        testMachine.withContext({
          willKafkaApiFail: false,
          willClusterApiFail: true,
          willConnectorsApiFail: false,
        })
      ).withEvents({
        clickConnector: async () => {
          fireEvent.change(screen.getByLabelText('filter by connector name'), {
            target: { value: 'telegram' },
          });
          const connector = await screen.findByText('telegram-source-source');
          fireEvent.click(connector);
          fireEvent.click(screen.getByText('Next'));
        },
        clickKafkaInstance: () => {
          fireEvent.click(screen.getByText('badwords'));
          fireEvent.click(screen.getByText('Next'));
        },
        onClose: () => {
          fireEvent.click(screen.getByText('Cancel'));
        },
      });

      const testPlans = testModel.getSimplePathPlans();
      testPlans.forEach(plan => {
        describe(plan.description, () => {
          beforeEach(mockApis.makeClusterError);
          afterEach(() => {
            jest.clearAllMocks();
          });
          plan.paths.forEach(path => {
            it(path.description, async () => {
              await act(async () => {
                const onClose = jest.fn();
                const onSave = jest.fn();

                render(
                  <CreationWizardMachineProvider
                    accessToken={() => Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                    onSave={onSave}
                  >
                    <CreationWizard onClose={onClose} />
                  </CreationWizardMachineProvider>
                );
                await path.test({ onClose, onSave });
              });
            });
          });
        });
      });
    });
  });
});
