/// <reference types="cypress" />

describe('Connectors page', () => {
  it('should render a list of connectors and poll for updates, the call to action to create a connector works', () => {
    cy.clock();
    cy.visit('http://localhost:1234');

    // first load, we should see a single connector
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectors.json',
    });
    cy.tick(1000);
    cy.findByText('Managed connectors').should('exist');
    cy.findByText('dbz-postgres-conn').should('exist');
    cy.findAllByText(
      (_, element) =>
        element?.className === 'pf-c-pagination__total-items' &&
        element?.textContent === '1 - 1 of 1 '
    );

    // test polling, we should see a second connector
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    });
    cy.tick(5000);
    cy.findByText('dbz-pg-lb').should('exist');

    // further requests should not add more connectors
    cy.tick(5000);
    cy.findAllByText(
      (_, element) =>
        element?.className === 'pf-c-pagination__total-items' &&
        element?.textContent === '1 - 2 of 2 '
    );

    cy.findByText('Create Connector').click();
    cy.findAllByText('Connector category').should('exist');
  });

  it('opens the details for a connector', () => {
    cy.visit('http://localhost:1234');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    });

    // should open the drawer with the details of the connector
    cy.findByText('dbz-postgres-conn').click();
    cy.findByText('Connector name').should('exist');
    cy.findByText('Details').should('exist');
    cy.findByText(
      'lb-cos--vgitqo-mk-imjg-eyqfbazqdiv.bf2.kafka.rhcloud.com:443'
    ).should('exist');
    cy.findByLabelText('Close drawer panel').click();
    cy.findByText('Connector name').should('not.exist');

    // should open the actions dropdown
    cy.findByTestId('actions-for-1vLK2A3Gl34hHjAxMj93Ma8Ajh8').click();
    cy.findByText('Details').click();
    cy.findByText('Connector name').should('exist');
    cy.findByText('Details').should('exist');
    cy.findByText(
      'lb-cos--vgitqo-mk-imjg-eyqfbazqdiv.bf2.kafka.rhcloud.com:443'
    ).should('exist');
    cy.findByLabelText('Close drawer panel').click();
  });

  it('allows actions to be triggered', () => {
    cy.visit('http://localhost:1234');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    });

    // should open the actions dropdown
    cy.findByTestId('actions-for-1vLK2A3Gl34hHjAxMj93Ma8Ajh8').click();
    cy.findByText('Start').should('exist');
    cy.findByText('Stop').should('exist');
    cy.findByText('Delete').should('exist');

    // assert that the PATCH calls gets fired with the right payload
    cy.intercept(
      'PATCH',
      `${Cypress.env('connectorsActionApiPath')}1vLK2A3Gl34hHjAxMj93Ma8Ajh8`
    ).as('stopPatch');
    cy.findByText('Start').should('have.attr', 'aria-disabled', 'true');
    cy.findByText('Stop').click();
    cy.wait('@stopPatch');
    cy.get('@stopPatch').should((req) => {
      expect(req.request.body).to.deep.equal({ desired_state: 'stopped' });
    });

    cy.findByTestId('actions-for-1vJTP1djNdu9Gl3hZjWl8nofYtk').click();
    cy.intercept(
      'PATCH',
      `${Cypress.env('connectorsActionApiPath')}1vJTP1djNdu9Gl3hZjWl8nofYtk`
    ).as('startPatch');
    cy.findByText('Stop').should('have.attr', 'aria-disabled', 'true');
    cy.findByText('Start').click();
    cy.wait('@startPatch');
    cy.get('@startPatch').should((req) => {
      expect(req.request.body).to.deep.equal({ desired_state: 'ready' });
    });
  });

  it('shows an empty state with no connectors, the call to action to create a connector works', () => {
    cy.visit('http://localhost:1234');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'noConnectors.json',
    });
    cy.findByText('cos.create_cos').click();
    cy.findAllByText('Connector category').should('exist');
  });

  it('shows an empty state with an API error and shows an error notification', () => {
    cy.visit('http://localhost:1234');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      statusCode: 404,
    });
    cy.findByText('common.something_went_wrong').should('exist');
    cy.findByText('cos.welcome_to_cos').should('exist');
  });

  it('errors on the API while polling are not shown to the user', () => {
    cy.clock();
    cy.visit('http://localhost:1234');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectors.json',
    });
    cy.tick(1000);
    cy.findByText('dbz-postgres-conn').should('exist');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      statusCode: 404,
    });
    cy.tick(5000);
    cy.findByText('dbz-postgres-conn').should('exist');
    cy.findAllByText('common.something_went_wrong').should('have.length', 0);
  });

  xit('can search for a connector', () => {
    cy.clock();
    cy.visit('http://localhost:1234');
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    });
    cy.tick(1000);
    cy.findByLabelText('filter by connector name').type('dbz-pg-lb');
    cy.findByLabelText('search button for search input').click();
    cy.tick(1000);
    cy.findByText('dbz-pg-lb').should('exist');
    cy.findAllByText('dbz-postgres-conn').should('have.length', 0);
  });
});
