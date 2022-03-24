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
        CLICK_CLUSTER: 'basicConfiguration',
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
    basicConfiguration: {
      on: {
        CONFIGURE_BASIC: 'configureConnector',
      },
    },

    configureConnector: {
      on: {
        CONFIGURE: 'errorConfiguration',
      },
      meta: {
        test: () => cy.findByText('Token').should('exist'),
      },
    },
    errorConfiguration: {
      on: {
        CONFIGURE_ERROR_HANDLER: 'configureConnector',
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
          cy.findByText('wuzard.creation-success').should('exist');
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
      cy.intercept(Cypress.env('serviceAccountApiPath'), {
        fixture: 'serviceAccount.json',
      }).as('serviceAccount');
      cy.intercept(Cypress.env('connectorCreationApiPath'), {
        fixture: 'connectorCreation.json',
      }).as('connectorCreation');
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
      CONFIGURE_BASIC: () => {
        cy.findByLabelText('Name *').type('my-connector');
        cy.findByLabelText('Client ID *').type('client-id');
        cy.findByLabelText('Client secret *').type('client-secret');
        cy.findByText('Next').should('be.enabled').click();
      },
      CONFIGURE_ERROR_HANDLER: () => {
        cy.findByText('Select Type').click();
      },
      CONFIGURE: () => {
        cy.findByLabelText('Token *').type('some-token');
        cy.findByText('Next').should('be.enabled').click();
      },
      SAVE_CONNECTOR: () => {
        cy.findByRole('button', { name: 'Create connector' })
          .should('be.enabled')
          .click();
        cy.wait('@serviceAccount')
          .its('request.body.name')
          .should('include', 'connector-telegram-source');
        cy.wait('@connectorCreation')
          .its('request.body')
          .should('deep.equal', {
            kind: 'Connector',
            name: 'my-connector',
            channel: 'stable',
            deployment_location: {
              kind: 'addon',
              cluster_id: '1r9uyAjkDfKKOr5pOnZbfdzj23D',
            },
            desired_state: 'ready',
            connector_type_id: 'telegram-source',
            kafka: {
              id: '1r9vAEfspruNoxIe4I9parl6dLo',
              url: 'demo',
            },
            service_account: {
              client_id: 'lorem',
              client_secret: 'dolor',
            },
            connector: {
              authorizationToken: 'some-token',
            },
          });
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
