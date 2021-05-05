/* eslint-disable testing-library/await-async-utils */
/* eslint-disable testing-library/await-async-query */
import React from 'react';
import {
  CreationWizard,
  CreationWizardMachineProvider,
} from '@cos-ui/creation-wizard';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
// import { assert } from 'chai';
import { createModel } from '@xstate/test';
import { Machine } from 'xstate';
import * as mockApis from './mockApis';

type TestContext = {
  onClose: () => void;
  onSave: () => void;
};
const testMachine = Machine({
  id: 'test-machine',
  initial: 'loadingKafka',
  context: {
    willKafkaApiFail: false,
    willClusterApiFail: false,
    willConnectorsApiFail: false,
  },
  states: {
    loadingKafka: {
      always: [
        { target: 'selectKafka', cond: ctx => !ctx.willKafkaApiFail },
        { target: 'error', cond: ctx => ctx.willKafkaApiFail },
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
    loadingClusters: {
      always: [
        {
          target: 'selectCluster',
          cond: ctx => !ctx.willClusterApiFail,
        },
        { target: 'error', cond: ctx => ctx.willClusterApiFail },
      ],
    },
    selectCluster: {
      on: {
        clickCluster: 'loadingConnectors',
      },
      meta: {
        test: () => waitFor(() => expect(screen.getByText('megalord'))),
      },
    },
    loadingConnectors: {
      always: [
        {
          target: 'selectConnector',
          cond: ctx => !ctx.willConnectorsApiFail,
        },
        { target: 'error', cond: ctx => ctx.willConnectorsApiFail },
      ],
    },
    selectConnector: {
      on: {
        clickConnector: 'configureConnector',
      },
      meta: {
        test: () =>
          waitFor(() => expect(screen.getByText('telegram-source-source'))),
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
              screen.getByDisplayValue('{"authorizationToken":"some-token"}')
            );
          }),
      },
    },
    saved: {
      type: 'final',
      meta: {
        test: ({ onClose, onSave }: TestContext) => {
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
    error: {
      meta: {
        test: () => waitFor(() => expect(screen.getByText('Error message'))),
      },
    },
  },
  on: {
    onClose: 'closed',
  },
});

describe('@cos-ui/creationWizard', () => {
  describe('CreationWizard', () => {
    describe('Happy path', () => {
      const testModel = createModel(testMachine).withEvents({
        clickOnDisabledNext: () => {
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
        clickConnector: () => {
          fireEvent.click(screen.getByText('telegram-source-source'));
          fireEvent.click(screen.getByText('Next'));
        },
        configure: async () => {
          fireEvent.change(screen.getByLabelText('Token *'), {
            target: { value: 'some-token' },
          });
          await waitFor(() => expect(screen.getByText('Next')).toBeEnabled());
          fireEvent.click(screen.getByText('Next'));
        },
        saveConnector: () => {
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
                    authToken={Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                  >
                    <CreationWizard onClose={onClose} onSave={onSave} />
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
            stateNode.id !== 'test-machine.error' && stateNode.meta,
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
                    authToken={Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                  >
                    <CreationWizard onClose={onClose} onSave={onSave} />
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
                    authToken={Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                  >
                    <CreationWizard onClose={onClose} onSave={onSave} />
                  </CreationWizardMachineProvider>
                );
                await path.test({ onClose, onSave });
              });
            });
          });
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
        clickKafkaInstance: () => {
          fireEvent.click(screen.getByText('badwords'));
          fireEvent.click(screen.getByText('Next'));
        },
        clickCluster: () => {
          fireEvent.click(screen.getByText('megalord'));
          fireEvent.click(screen.getByText('Next'));
        },
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
                    authToken={Promise.resolve('dummy')}
                    basePath={'/dummy'}
                    fetchConfigurator={() =>
                      Promise.resolve({ steps: false, Configurator: false })
                    }
                  >
                    <CreationWizard onClose={onClose} onSave={onSave} />
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
