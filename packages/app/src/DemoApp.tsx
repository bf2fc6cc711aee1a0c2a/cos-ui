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
import { Routes } from './Routes';
import { AuthContext } from './auth/AuthContext';

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
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <Router>
          <AppLayout>
            {initialized ? <ConnectedRoutes /> : <Spinner />}
          </AppLayout>
        </Router>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};

const ConnectedRoutes = () => {
  const authContext = useContext(AuthContext);

  return (
    <Routes
      getToken={
        authContext?.getToken ? authContext.getToken() : Promise.resolve('')
      }
    />
  );
};
