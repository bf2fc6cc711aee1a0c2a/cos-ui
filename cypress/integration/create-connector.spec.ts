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
        clickConnector: 'loadingKafka',
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
        clickKafkaInstance: 'loadingClusters',
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
        clickCluster: 'configureConnector',
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
        configure: 'review',
      },
      meta: {
        test: () => cy.findByText('Token').should('exist'),
      },
    },
    review: {
      on: {
        saveConnector: 'saved',
      },
      meta: {
        test: () => {
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
        test: () => {
          // await waitForElementToBeRemoved(() =>
          //   screen.queryByText('Create connector')
          // );
        },
      },
      on: {
        onClose: undefined,
      },
    },
    closed: {
      type: 'final',
      meta: {
        test: () => {},
      },
    },
  },
  on: {
    onClose: 'closed',
  },
});

function runTheTests(testModel: TestModel<any, any>) {
  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      // beforeEach(mockApis.makeHappyPath);
      plan.paths.forEach((path) => {
        it(path.description, () => {
          // const onClose = jest.fn();
          // const onSave = jest.fn();

          cy.visit('http://localhost:1234/create-connector').then(path.test);
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
      clickOnDisabledNext: () => {
        cy.findByText('Next').click();
      },
      clickConnector: () => {
        cy.findByLabelText('filter by connector name').type('telegram');
        cy.findByText('telegram-source-source').click();
        cy.findByText('Next').click();
      },
      clickKafkaInstance: () => {
        cy.findByText('badwords').click();
        cy.findByText('Next').click();
      },
      clickCluster: () => {
        cy.findByText('megalord').click();
        cy.findByText('Next').click();
      },
      configure: () => {
        cy.findByLabelText('Token *').type('some-token');
        cy.findByText('Next').should('be.enabled').click();
      },
      saveConnector: () => {
        cy.findByLabelText('Name *').type('my-connector');
        cy.findByRole('button', { name: 'Create connector' })
          .should('be.enabled')
          .click();
      },
      onClose: () => {
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
      onClose: () => {
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
      clickConnector: () => {
        cy.findByLabelText('filter by connector name').type('telegram');
        cy.findByText('telegram-source-source').click();

        cy.findByText('Next').click();
      },
      onClose: () => {
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
      clickConnector: () => {
        cy.findByLabelText('filter by connector name').type('telegram');
        cy.findByText('telegram-source-source').click();
        cy.findByText('Next').click();
      },
      clickKafkaInstance: () => {
        cy.findByText('badwords').click();
        cy.findByText('Next').click();
      },
      onClose: () => {
        cy.findByText('Cancel').click();
      },
    });

    runTheTests(testModel);
  });
});
