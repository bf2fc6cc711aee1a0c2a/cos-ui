/// <reference types="cypress" />

describe('Connectors page', () => {
  it('should render a list of connectors and poll for updates', () => {
    cy.clock();
    cy.visit('http://localhost:1234');

    // first load, we should see a single connector
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectors.json',
    });
    cy.tick(100);
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
  });
  it('opens the details for a connector', () => {
    // should open the drawer with the details of the connector
    cy.findByText('dbz-postgres-conn').click();
    cy.findByText('Connector name').should('exist');
    cy.findByText('Overview').should('exist');
    cy.findByText(
      'lb-cos--vgitqo-mk-imjg-eyqfbazqdiv.bf2.kafka.rhcloud.com:443'
    ).should('exist');
    cy.findByLabelText('Close drawer panel').click();
    cy.findByText('Connector name').should('not.exist');

    // should open the actions dropdown
    cy.findByTestId('actions-for-1vLK2A3Gl34hHjAxMj93Ma8Ajh8').click();
    cy.findByText('Overview').click();
    cy.findByText('Connector name').should('exist');
    cy.findByText('Overview').should('exist');
    cy.findByText(
      'lb-cos--vgitqo-mk-imjg-eyqfbazqdiv.bf2.kafka.rhcloud.com:443'
    ).should('exist');
    cy.findByLabelText('Close drawer panel').click();
  });
  it('allows actions to be triggered', () => {
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
    cy.get('@stopPatch').should(req => {
      expect(req.request.body).to.deep.equal({ desired_state: 'stopped' });
    });

    cy.findByTestId('actions-for-1vJTP1djNdu9Gl3hZjWl8nofYtk').click();
    cy.intercept(
      'PATCH',
      `${Cypress.env('connectorsActionApiPath')}1vJTP1djNdu9Gl3hZjWl8nofYtk`
    ).as('startPatch');
    cy.findByText('Stop').should('have.attr', 'aria-disabled', 'true');
    cy.findByText('Start').click();
    cy.get('@startPatch').should(req => {
      expect(req.request.body).to.deep.equal({ desired_state: 'ready' });
    });
  });
});
