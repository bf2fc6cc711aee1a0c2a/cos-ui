/// <reference types="cypress" />
import { createModel, TestModel } from '@xstate/test';
import { Machine } from 'xstate';

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
          cond: (ctx) => !ctx.willConnectorsApiFail,
        },
        {
          target: 'selectConnectorEmptyState',
          cond: (ctx) => ctx.willConnectorsApiFail,
        },
      ],
    },
    selectConnector: {
      on: {
        CLICK_CONNECTOR: 'loadingKafka',
      },
      meta: {
        test: () => cy.findByText('telegram-source-source').should('exist'),
      },
    },
    selectConnectorEmptyState: {
      meta: {
        noCoverage: true,
        test: () => cy.findByText('Something went wrong').should('exist'),
      },
    },
    loadingKafka: {
      always: [
        { target: 'selectKafka', cond: (ctx) => !ctx.willKafkaApiFail },
        {
          target: 'selectKafkaEmptyState',
          cond: (ctx) => ctx.willKafkaApiFail,
        },
      ],
    },
    selectKafka: {
      on: {
        CLICK_KAFKA_INSTANCE: 'loadingClusters',
      },
      meta: {
        test: () => cy.findByText('badwords').should('exist'),
      },
    },
    selectKafkaEmptyState: {
      meta: {
        noCoverage: true,
        test: () =>
          cy.findByText('No Kafka instance available').should('exist'),
      },
    },
    loadingClusters: {
      always: [
        {
          target: 'selectCluster',
          cond: (ctx) => !ctx.willClusterApiFail,
        },
        {
          target: 'selectClusterEmptyState',
          cond: (ctx) => ctx.willClusterApiFail,
        },
      ],
    },
    selectCluster: {
      on: {
        CLICK_CLUSTER: 'configureConnector',
      },
      meta: {
        test: () => cy.findByText('megalord').should('exist'),
      },
    },
    selectClusterEmptyState: {
      meta: {
        noCoverage: true,
        test: () => cy.findByText('No OSD Cluster available').should('exist'),
      },
    },
    configureConnector: {
      on: {
        CONFIGURE: 'review',
      },
      meta: {
        test: () => cy.findByText('Token').should('exist'),
      },
    },
    review: {
      on: {
        SAVE_CONNECTOR: 'saved',
      },
      meta: {
        TEST: () => {
          cy.findByText('Please review the configuration data.').should(
            'exist'
          );
          cy.findByDisplayValue(
            '{ "authorizationToken": "some-token" }'
          ).should('exist');
        },
      },
    },
    saved: {
      type: 'final',
      meta: {
        TEST: () => {
          // await waitForElementToBeRemoved(() =>
          //   screen.queryByText('Create connector')
          // );
        },
      },
      on: {
        ON_CLOSE: undefined,
      },
    },
    closed: {
      type: 'final',
      meta: {
        TEST: () => {},
      },
    },
  },
  on: {
    ON_CLOSE: 'closed',
  },
});

function runTheTests(testModel: TestModel<any, any>) {
  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      // beforeEach(async mockApis.makeHappyPath);
      plan.paths.forEach((path) => {
        it(path.description, () => {
          // const onClose = jest.fn();
          // const onSave = jest.fn();

          cy.visit(Cypress.env('wizard')).then(path.test);
        });
      });
    });
  });
}

describe('Connector creation', () => {
  describe('Happy path', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('connectorTypesApiPath'), {
        fixture: 'connectorTypes.json',
      });
      cy.intercept(Cypress.env('kafkasApiPath'), {
        fixture: 'kafkas.json',
      });
      cy.intercept(Cypress.env('clustersApiPath'), {
        fixture: 'clusters.json',
      });
    });
    const testModel = createModel(testMachine).withEvents({
      CLICK_ON_DISABLED_NEXT: () => {
        cy.findByText('Next').click();
      },
      CLICK_CONNECTOR: () => {
        cy.findByLabelText('filter by connector name').type('telegram');
        cy.findByText('telegram-source-source').click();
        cy.findByText('Next').click();
      },
      CLICK_KAFKA_INSTANCE: () => {
        cy.findByText('badwords').click();
        cy.findByText('Next').click();
      },
      CLICK_CLUSTER: () => {
        cy.findByText('megalord').click();
        cy.findByText('Next').click();
      },
      CONFIGURE: () => {
        cy.findByLabelText('Token *').type('some-token');
        cy.findByText('Verify configuration').click();
        cy.findByText('Next').should('be.enabled').click();
      },
      SAVE_CONNECTOR: () => {
        cy.findByLabelText('Name *').type('my-connector');
        cy.findByRole('button', { name: 'Create connector' })
          .should('be.enabled')
          .click();
      },
      ON_CLOSE: () => {
        cy.findByText('Cancel').click();
      },
    });

    runTheTests(testModel);
  });

  describe('Connectors API error', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('connectorTypesApiPath'), {
        statusCode: 404,
      });
    });
    const testModel = createModel(
      testMachine.withContext({
        willKafkaApiFail: false,
        willClusterApiFail: false,
        willConnectorsApiFail: true,
      })
    ).withEvents({
      ON_CLOSE: () => {
        cy.findByText('Cancel').click();
      },
    });

    runTheTests(testModel);
  });

  describe('Kafka API error', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('connectorTypesApiPath'), {
        fixture: 'connectorTypes.json',
      });
      cy.intercept(Cypress.env('kafkasApiPath'), {
        statusCode: 404,
      });
    });
    const testModel = createModel(
      testMachine.withContext({
        willKafkaApiFail: true,
        willClusterApiFail: false,
        willConnectorsApiFail: false,
      })
    ).withEvents({
      CLICK_CONNECTOR: () => {
        cy.findByLabelText('filter by connector name').type('telegram');
        cy.findByText('telegram-source-source').click();

        cy.findByText('Next').click();
      },
      ON_CLOSE: () => {
        cy.findByText('Cancel').click();
      },
    });

    runTheTests(testModel);
  });

  describe('Clusters API error', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('connectorTypesApiPath'), {
        fixture: 'connectorTypes.json',
      });
      cy.intercept(Cypress.env('kafkasApiPath'), {
        fixture: 'kafkas.json',
      });
      cy.intercept(Cypress.env('clustersApiPath'), {
        statusCode: 404,
      });
    });
    const testModel = createModel(
      testMachine.withContext({
        willKafkaApiFail: false,
        willClusterApiFail: true,
        willConnectorsApiFail: false,
      })
    ).withEvents({
      CLICK_CONNECTOR: () => {
        cy.findByLabelText('filter by connector name').type('telegram');
        cy.findByText('telegram-source-source').click();
        cy.findByText('Next').click();
      },
      CLICK_KAFKA_INSTANCE: () => {
        cy.findByText('badwords').click();
        cy.findByText('Next').click();
      },
      ON_CLOSE: () => {
        cy.findByText('Cancel').click();
      },
    });

    runTheTests(testModel);
  });
});
