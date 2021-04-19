import '@patternfly/react-core/dist/styles/base.css';
import * as React from 'react';
import { Page, Spinner } from '@patternfly/react-core';
import { ConnectorType } from '@kas-connectors/api';
import {
  CreationWizard,
  CreationWizardMachineProvider,
} from '@kas-connectors/creationWizard';
import {
  ConnectorConfiguratorResponse,
} from '@kas-connectors/machines';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { AuthContext } from './auth/AuthContext';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import Keycloak from 'keycloak-js';
import { loadFederatedConfigurator } from './FederatedConfigurator';

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

  if (!initialized) return <Spinner />;

  return (
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <Page>
          <ConnectedCreationWizard />
        </Page>
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
      <CreationWizard />
    </CreationWizardMachineProvider>
  );
};


const loadFederatedModule = async (url: string ) => {
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
  })
};

const fetchConfigurator = async (
  connector: ConnectorType
): Promise<ConnectorConfiguratorResponse> => {
  switch (connector.id) {
    case 'aws-kinesis-source':
      await loadFederatedModule('http://localhost:3002/foo-connector-configurator.remoteEntry.js');
      return loadFederatedConfigurator('someProject_FooConnectorConfigurator', './config');
    default:
      return Promise.resolve({
        steps: false,
        Configurator: () => <p>TODO: json-schema based configurator</p>,
      });
  }
};