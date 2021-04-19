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
  ToolbarItem,
} from '@patternfly/react-core';
import { ConnectorType } from '@kas-connectors/api';
import {
  CreationWizard,
  CreationWizardMachineProvider,
} from '@kas-connectors/creationWizard';
import { ConnectorConfiguratorResponse } from '@kas-connectors/machines';
import Keycloak from 'keycloak-js';
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { AuthContext } from './auth/AuthContext';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import { loadFederatedConfigurator } from './FederatedConfigurator';
import { AppLayout } from './AppLayout';
import { Connectors } from './Connectors';
import { SearchIcon } from '@patternfly/react-icons';

let keycloak: Keycloak.KeycloakInstance | undefined;

const App = () => {
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
            {initialized ? <ConnectedCreationWizard /> : <Spinner />}
          </AppLayout>
        </Router>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};

export default App;

const ConnectedCreationWizard = () => {
  const authContext = React.useContext(AuthContext);

  return (
    <CreationWizardMachineProvider
      authToken={
        authContext?.getToken ? authContext.getToken() : Promise.resolve('')
      }
      basePath={process.env.BASE_PATH}
      fetchConfigurator={fetchConfigurator}
    >
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
                      aria-label="search input example"
                    />
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
            <CreationWizard />
          </PageSection>
        </Route>
      </Switch>
    </CreationWizardMachineProvider>
  );
};

const loadFederatedModule = async (url: string) => {
  return new Promise<void>((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic federated module Loaded: ${url}`);
      document.head.removeChild(element);
      resolve();
    };

    element.onerror = () => {
      console.error(`Dynamic federated module Error: ${url}`);
      console.log(`Dynamic federated module Removed: ${url}`);
      document.head.removeChild(element);
      reject();
    };

    document.head.appendChild(element);
  });
};

const fetchConfigurator = async (
  connector: ConnectorType
): Promise<ConnectorConfiguratorResponse> => {
  switch (connector.id) {
    case 'aws-kinesis-source':
      await loadFederatedModule(
        'http://localhost:3002/foo-connector-configurator.remoteEntry.js'
      );
      return loadFederatedConfigurator(
        'someProject_FooConnectorConfigurator',
        './config'
      );
    default:
      return Promise.resolve({
        steps: false,
        Configurator: () => <p>TODO: json-schema based configurator</p>,
      });
  }
};
