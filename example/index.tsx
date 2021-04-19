import { inspect } from '@xstate/inspect';
import 'react-app-polyfill/ie11';
import '@patternfly/react-core/dist/styles/base.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Page, Spinner } from '@patternfly/react-core';
import { CreationWizard, CreationWizardMachineProvider } from '@kas-connectors/creationWizard';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { AuthContext } from './auth/AuthContext';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import Keycloak from 'keycloak-js';
import { ConnectorType } from '@kas-connectors/api';
import { ConnectorConfiguratorProps, ConnectorConfiguratorResponse } from '@kas-connectors/machines';

let keycloak: Keycloak.KeycloakInstance | undefined;

inspect({
  iframe: false,
});

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


export const SampleConfigurator: React.FunctionComponent<ConnectorConfiguratorProps> = ({
  activeStep,
  connector,
  configuration,
  onChange,
}) => (
  <div>
    <p>Connector: {connector.name}</p>
    <p>Active step: {activeStep}</p>
    <p>
      Configuration: {JSON.stringify(configuration) || typeof configuration}
    </p>
    <button
      onClick={() =>
        onChange(
          {
            ...(configuration && configuration),
            ts: Date.now(),
          },
          true
        )
      }
    >
      Set valid
    </button>
  </div>
);


const fetchConfigurator = (
  connector: ConnectorType
): Promise<ConnectorConfiguratorResponse> => {
  switch (connector.id) {
    case 'aws-kinesis-source':
      // this will come from a remote entry point, eg. debezium
      return Promise.resolve({
        steps: ['First step', 'Second step', 'Third step'],
        Configurator: SampleConfigurator,
      });
    default:
      return Promise.resolve({
        steps: false,
        Configurator: () => <p>TODO: json-schema based configurator</p>,
      });
  }
};

ReactDOM.render(<App />, document.getElementById('root'));
