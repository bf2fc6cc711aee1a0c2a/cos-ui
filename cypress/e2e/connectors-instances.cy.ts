/// <reference types="cypress" />

describe('Connectors page', () => {
  it('should render a list of connectors as expected and poll for updates, the call to action to create a connector works', () => {
    cy.clock();
    // first load, we should see a single connector
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectors.json',
    }).as('initialConnectors');

    cy.visit(Cypress.env('homepage'));

    cy.tick(1000);
    cy.wait('@initialConnectors');

    cy.findByText('Managed connectors').should('exist');
    cy.findByText('dbz-postgres-conn').should('have.length', 1);

    // test polling, we should see a second connector
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    }).as('polledConnectors');
    cy.tick(5000);
    cy.wait('@polledConnectors');

    cy.findByText('dbz-postgres-conn').should('have.length', 1);
    cy.findByText('dbz-pg-lb').should('have.length', 1);

    // connector in deleting should have action not clickable
    cy.findByTestId('actions-for-c9v7a91rrl5s1sq2t9ag').click();
    cy.findByLabelText('Close drawer panel').click();
    cy.findByText('Start Instance').should('not.exist');

    cy.findByTestId('actions-for-1vLK2A3Gl34hHjAxMj93Ma8Ajh8').click();
    cy.findByText('Start Instance').should('exist');

    // connector name should not be clickable for deleting state
    cy.contains('deleting-connector')
      .invoke('prop', 'tagName')
      .should('equal', 'P');
    cy.contains('not-deleting').invoke('prop', 'tagName').should('equal', 'A');

    // further requests should not add more connectors
    cy.tick(5000);
    cy.wait('@polledConnectors');

    // 6 rows of data and 1 header row
    cy.get('tr').should('have.length', 7);

    cy.findByText('Create Connectors instance').click();
  });

  it('opens the details for a connector', () => {
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    }).as('connectors');
    cy.visit(Cypress.env('homepage'));
    // should open the drawer with the details of the connector
    cy.findByText('debezium-postgres-1.9.0.Alpha1').click({ force: true });
    cy.intercept(Cypress.env('namespaceApiPath'), {
      fixture: 'namespace.json',
    }).as('namespace');
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

  it('allows actions to be triggered and clicking delete should show a modal prompt', () => {
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    }).as('connectors');
    cy.visit(Cypress.env('homepage'));
    cy.wait('@connectors');

    // should open the actions dropdown
    cy.findByTestId('actions-for-1vLK2A3Gl34hHjAxMj93Ma8Ajh8').click();
    cy.findByText('Start Instance').should('exist');
    cy.findByText('Stop instance').should('exist');
    cy.findByText('Delete instance').should('exist');

    // assert that the PATCH calls gets fired with the right payload
    cy.fixture('connectorsPolling.json').then((response) => {
      cy.intercept(
        'PATCH',
        `${Cypress.env('connectorsActionApiPath')}1vLK2A3Gl34hHjAxMj93Ma8Ajh8`,
        response.items.find(
          (item: any) => item.id === '1vLK2A3Gl34hHjAxMj93Ma8Ajh8'
        )
      ).as('stopPatch');
      cy.intercept(
        'PATCH',
        `${Cypress.env('connectorsActionApiPath')}1vJTP1djNdu9Gl3hZjWl8nofYtk`,
        response.items.find(
          (item: any) => item.id === '1vJTP1djNdu9Gl3hZjWl8nofYtk'
        )
      ).as('startPatch');
      cy.intercept(
        'DELETE',
        `${Cypress.env('connectorsActionApiPath')}c9uc8g84k5n8rhm5r16g`,
        response.items.find((item: any) => item.id === 'c9uc8g84k5n8rhm5r16g')
      ).as('deletePatch');
    });

    cy.findByText('Start Instance').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
    cy.findByText('Stop instance').click();
    cy.wait('@stopPatch')
      .its('request.body')
      .should('deep.equal', { desired_state: 'stopped' });

    cy.findByTestId('actions-for-1vJTP1djNdu9Gl3hZjWl8nofYtk').click();
    cy.findByText('Stop instance').should('have.attr', 'aria-disabled', 'true');
    cy.findByText('Start Instance').click();
    cy.wait('@startPatch')
      .its('request.body')
      .should('deep.equal', { desired_state: 'ready' });

    cy.findByTestId('actions-for-c9uc8g84k5n8rhm5r16g').click();
    cy.findByText('Delete instance').click();
    cy.findByText('Delete connector?').should('exist');
    cy.findByTestId('delete-connector-instance-modal-input').type(
      'ob-dev-prcs-0308c1e7-213c-45ce-8cfd-97b56c10d7c3'
    );
    cy.findByTestId('delete-connector-instance-modal-delete-button').click();
    cy.wait('@deletePatch').its('request.body').should('deep.equal', '');
  });

  it('shows an empty state with no connectors, the call to action to create a connector works', () => {
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'noConnectors.json',
    }).as('noConnectors');
    cy.visit(Cypress.env('homepage')).wait('@noConnectors');
    cy.findByText('No Connectors instances').click();
    cy.findAllByText('Create Connectors instance').should('exist');
  });

  it('shows an empty state with an API error and shows an error notification', () => {
    cy.intercept(Cypress.env('connectorsApiPath'), {
      statusCode: 404,
    });
    cy.visit(Cypress.env('homepage'));
    cy.findAllByText('Something went wrong').should('exist');
  });

  it('errors on the API while polling are not shown to the user', () => {
    cy.clock();
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectors.json',
    }).as('connectors');
    cy.visit(Cypress.env('homepage'));
    cy.tick(1000);
    cy.wait('@connectors');

    cy.findByText('dbz-postgres-conn').should('exist');

    cy.intercept(Cypress.env('connectorsApiPath'), {
      statusCode: 404,
    }).as('connectorsWithError');
    cy.tick(5000);
    cy.wait('@connectorsWithError');
    cy.findByText('dbz-postgres-conn').should('exist');
    cy.findAllByText('Something went wrong').should('have.length', 0);
  });

  it('can search for a connector', () => {
    cy.clock();
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsPolling.json',
    }).as('connectors');
    cy.visit(Cypress.env('homepage'));
    cy.tick(1000);
    cy.wait('@connectors');

    cy.get('table').findByText('dbz-pg-lb').should('exist');
    cy.get('table').findAllByText('dbz-postgres-conn').should('exist');

    cy.intercept(
      `${Cypress.env(
        'connectorsApiPath'
      )}%28+name+ILIKE+%27%25dbz-postgres-conn%25%27%29`,
      {
        fixture: 'connectors.json',
      }
    ).as('connectorsSearch');

    cy.findAllByLabelText('Filter by name').eq(0).type('dbz-postgres-conn');
    cy.findAllByLabelText('Search').eq(0).click();

    cy.wait('@connectorsSearch');
    cy.get('table').findByText('dbz-pg-lb').should('have.length', 0);
    cy.get('table').findAllByText('dbz-postgres-conn').should('exist');
  });

  it('will show "No results" when pages greater than 1 return no items', () => {
    cy.clock();
    cy.intercept(Cypress.env('connectorsApiPath'), {
      fixture: 'connectorsMany.json',
    }).as('connectors');
    cy.visit(Cypress.env('homepage'));
    cy.tick(1000);
    cy.wait('@connectors');

    cy.findByText('Managed connectors').should('exist');
    cy.findByText('dbz-postgres-conn').should('have.length', 1);

    // simulating retrieval of a page with no items
    cy.intercept(
      `${Cypress.env(
        'connectorsApiPathNoQueryParams'
      )}?page=2&size=20&orderBy=&search=`,
      {
        fixture: 'connectorsEmptyPage.json',
      }
    ).as('connectorsEmptyPage');

    cy.findAllByLabelText('Go to next page').eq(0).click();

    cy.wait('@connectorsEmptyPage');
    cy.get('table').findByText('dbz-postgres-conn').should('have.length', 0);
    // the "No results" message is shown for the current page
    cy.findAllByText('No results found').should('exist');
  });
});
