import '@patternfly/react-core/dist/styles/base.css';
import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  Spinner,
} from '@patternfly/react-core';
import Keycloak from 'keycloak-js';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import { AppLayout } from './AppLayout';
import { AppRoutes } from './AppRoutes';

let keycloak: Keycloak.KeycloakInstance | undefined;

export const App: FunctionComponent = () => {
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
          <AppLayout>{initialized ? <AppRoutes /> : <Spinner />}</AppLayout>
        </Router>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};


