import { inspect } from '@xstate/inspect';
import 'react-app-polyfill/ie11';
import '@patternfly/react-core/dist/styles/base.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Page, Spinner } from '@patternfly/react-core';
import { CreationWizard } from '@kas-connectors/creationWizard';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { AuthContext } from './auth/AuthContext';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import Keycloak from 'keycloak-js';

let keycloak: Keycloak.KeycloakInstance | undefined;

inspect({
  iframe: false
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
    <CreationWizard authToken={authContext?.getToken ? authContext.getToken() : Promise.resolve('')} basePath={process.env.BASE_PATH} />
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
