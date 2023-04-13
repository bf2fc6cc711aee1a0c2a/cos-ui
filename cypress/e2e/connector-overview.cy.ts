/// <reference types="cypress" />

describe(
  'Overview page',
  {
    env: {
      configuration: 'cc1p3tjvcap6794aj210#configuration',
      overview: '/cc1p3tjvcap6794aj210#overview',
      overviewApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connectors/cc1p3tjvcap6794aj210',
      overviewKafkaApiPath:
        '/localhost/api/kafkas_mgmt/v1/kafkas/cc1k0lb1svndrpod5hcg',
      overviewKafkaNamespaceApiPath:
        'localhost/api/connector_mgmt/v1/kafka_connector_namespaces/ca34tr1nnj5k851srhk0',
      overviewConnectorDefinitionPath:
        'localhost/api/connector_mgmt/v1/kafka_connector_types/slack_source_0.1',
    },
  },
  () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('overviewApiPath'), {
        method: 'GET',
        fixture: 'connectorOverview/cc1p3tjvcap6794aj210.json',
      }).as('slack-connector');
      cy.intercept(Cypress.env('overviewKafkaApiPath'), {
        fixture: 'connectorOverview/cc1k0lb1svndrpod5hcg.json',
      }).as('slack-connector-kafka');
      cy.intercept(Cypress.env('overviewKafkaNamespaceApiPath'), {
        fixture: 'connectorOverview/ca34tr1nnj5k851srhk0.json',
      }).as('slack-connector-kafka-namespace');
      cy.intercept(Cypress.env('overviewConnectorDefinitionPath'), {
        fixture: 'connectorOverview/slack_source_0.1.json',
      }).as('slack-connector-definition');
    });

    const waitForData = () => {
      cy.wait('@slack-connector');
      cy.wait('@slack-connector-definition');
      cy.wait('@slack-connector-kafka');
      cy.wait('@slack-connector-kafka-namespace');
    };

    it('should show the overview for a connector with the appropriate kafka and namespace', () => {
      cy.visit(Cypress.env('overview'));
      waitForData();
      cy.findByText('cc1p3tjvcap6794aj210').should('exist');
      cy.findByText('lb-cos').should('exist');
      cy.findByText('default-connector-namespace').should('exist');
    });

    it('should show the connector configuration, edit the properties, clear a value and save it successfully', () => {
      cy.visit(Cypress.env('overview'));
      waitForData();
      cy.findByText('Configuration').click({ force: true });
      cy.findAllByTestId('tab-connector-specific').first().click();
      cy.findByText('Edit Properties').click();
      cy.findByLabelText('Delay').clear();
      cy.intercept(Cypress.env('overviewApiPath'), {
        method: 'PATCH',
        fixture: 'connectorOverview/cc1p3tjvcap6794aj210.json',
      }).as('handlePatch');
      cy.findByText('Save').click();
      cy.wait('@handlePatch')
        .its('request.body')
        .should('deep.equal', {
          connector: {
            slack_delay: null,
            data_shape: { produces: { format: 'application/json' } },
          },
        });
    });

    it('should change the error handler from stop to log with the correct request', () => {
      cy.visit(Cypress.env('overview'));
      waitForData();
      cy.findByText('Configuration').click({ force: true });
      cy.findAllByTestId('tab-error-handling').first().click();
      cy.findByText('Edit Properties').click();
      cy.findByTestId('option-log').click();
      cy.intercept(Cypress.env('overviewApiPath'), {
        method: 'PATCH',
        fixture: 'connectorOverview/cc1p3tjvcap6794aj210.json',
      }).as('handlePatch');
      cy.findByText('Save').click();
      cy.wait('@handlePatch')
        .its('request.body')
        .should('deep.equal', {
          connector: {
            error_handler: {
              log: {},
              stop: null,
            },
          },
        });
    });
  }
);
