import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Spinner } from '@patternfly/react-core';
import Keycloak from 'keycloak-js';
import { BrowserRouter as Router } from 'react-router-dom';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import { AppLayout } from './AppLayout';
import { CosUiRoutes } from './CosUiRoutes';
import { AuthContext } from './auth/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

let keycloak: Keycloak.KeycloakInstance | undefined;

export const DemoApp: FunctionComponent = () => {
  const [initialized, setInitialized] = useState(false);

  // Initialize the client
  useEffect(() => {
    const init = async () => {
      keycloak = await getKeycloakInstance();
      setInitialized(true);
    };
    init();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <KeycloakContext.Provider
        value={{ keycloak, profile: keycloak?.profile }}
      >
        <KeycloakAuthProvider>
          <Router>
            <React.Suspense fallback={null}>
              <AppLayout>
                {initialized ? <ConnectedRoutes /> : <Spinner />}
              </AppLayout>
            </React.Suspense>
          </Router>
        </KeycloakAuthProvider>
      </KeycloakContext.Provider>
    </I18nextProvider>
  );
};

const ConnectedRoutes = () => {
  const authContext = useContext(AuthContext);

  return (
    <CosUiRoutes
      getToken={
        authContext?.getToken ? authContext.getToken() : Promise.resolve('')
      }
      apiBasepath={process.env.BASE_PATH as string}
    />
  );
};
