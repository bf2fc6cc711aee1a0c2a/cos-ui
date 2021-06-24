import React, { FunctionComponent, useEffect, useState } from 'react';
import { Spinner } from '@patternfly/react-core';
import { useAuth, ConfigContext, Config, useConfig } from '@bf2/ui-shared';
import Keycloak from 'keycloak-js';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Loading } from '@cos-ui/utils';
import i18n from './i18n';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from './auth/keycloak/KeycloakContext';
import { AppLayout } from './AppLayout';
import { CosUiRoutes } from './CosUiRoutes';

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

  const config = {
    cos: {
      apiBasePath: process.env.BASE_PATH as string,
      configurators: {
        'debezium-mongodb-1.5.0.Final': {
          remoteEntry:
            'http://localhost:8888/dbz-connector-configurator.remoteEntry.js',
          scope: 'debezium_ui',
          module: './config',
        },
        'debezium-mysql-1.5.0.Final': {
          remoteEntry:
            'http://localhost:8888/dbz-connector-configurator.remoteEntry.js',
          scope: 'debezium_ui',
          module: './config',
        },
        'debezium-postgres-1.5.0.Final': {
          remoteEntry:
            'http://localhost:8888/dbz-connector-configurator.remoteEntry.js',
          scope: 'debezium_ui',
          module: './config',
        },
      } as Record<string, unknown>,
    },
  } as Config;

  return (
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <ConfigContext.Provider value={config}>
          <I18nextProvider i18n={i18n}>
            <React.Suspense fallback={<Loading />}>
              <Router>
                <AppLayout>
                  {initialized ? <ConnectedRoutes /> : <Spinner />}
                </AppLayout>
              </Router>
            </React.Suspense>
          </I18nextProvider>
        </ConfigContext.Provider>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};

const ConnectedRoutes = () => {
  const auth = useAuth();
  const { cos } = useConfig();

  return (
    <CosUiRoutes getToken={auth.kas.getToken} apiBasepath={cos.apiBasePath} />
  );
};
