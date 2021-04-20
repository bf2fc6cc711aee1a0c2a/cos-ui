import '@patternfly/react-core/dist/styles/base.css';
import * as React from 'react';
import {
  Button,
  ButtonVariant,
  InputGroup,
  Level,
  LevelItem,
  PageSection,
  Spinner,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import Keycloak from 'keycloak-js';
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import { AppLayout } from './AppLayout';
import { Connectors } from './Connectors';
import { ConnectedCreationWizard } from './ConnectedCreationWizard';

let keycloak: Keycloak.KeycloakInstance | undefined;

export const App: React.FunctionComponent = () => {
  const [initialized, setInitialized] = React.useState(false);

  // Initialize the client
  React.useEffect(() => {
    const init = async () => {
      keycloak = await getKeycloakInstance();
      setInitialized(true);
    };
    init();
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <Router>
          <AppLayout>
            {initialized ? (
              <Switch>
                <Route path={'/'} exact>
                  <PageSection variant={'light'}>
                    <Level>
                      <LevelItem>
                        <Title headingLevel="h1" size="lg">
                          Managed Connectors
                        </Title>
                      </LevelItem>
                    </Level>
                  </PageSection>
                  <PageSection variant={'light'} padding={{ default: 'noPadding' }}>
                    <Toolbar id="toolbar">
                      <ToolbarContent>
                        <ToolbarItem>
                          <InputGroup>
                            <TextInput
                              name="textInput1"
                              id="textInput1"
                              type="search"
                              aria-label="search input example" />
                            <Button
                              variant={ButtonVariant.control}
                              aria-label="search button for search input"
                            >
                              <SearchIcon />
                            </Button>
                          </InputGroup>
                        </ToolbarItem>
                        <ToolbarItem>
                          <NavLink className="pf-c-button pf-m-primary" to={"/create-connector"}>Create Connector</NavLink>
                        </ToolbarItem>
                      </ToolbarContent>
                    </Toolbar>
                    <Connectors />
                  </PageSection>
                </Route>
                <Route path={'/create-connector'}>
                  <PageSection padding={{ default: "noPadding" }}>
                    <ConnectedCreationWizard />
                  </PageSection>
                </Route>
              </Switch>
            ) : <Spinner />}
          </AppLayout>
        </Router>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};


