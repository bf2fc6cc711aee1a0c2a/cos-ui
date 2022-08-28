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
      cy.wait('@slack-connector', { timeout: 6000 });
      cy.wait('@slack-connector-definition', { timeout: 6000 });
      cy.wait('@slack-connector-kafka', { timeout: 6000 });
      cy.wait('@slack-connector-kafka-namespace', { timeout: 6000 });
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
      cy.findByText('Configuration').click();
      // findAllByTestId seems like a work around
      cy.findAllByTestId('tab-connector-specific').first().click();
      
      // temporary work around, this element shouldn't show up
      // cy.findByText('Cancel').click();

      cy.findByText('Edit Properties').click();

      cy.findByLabelText('Delay').clear();
      cy.findByText('Save').click();
      cy.wait('@slack-connector')
        .its('request.body')
        .should('deep.equal', {
          connector: {
            slack_delay: null,
            data_shape: { produces: { format: 'application/json' } },
          },
        });
    });
  }
);
