import Keycloak from 'keycloak-js';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import { Spinner } from '@patternfly/react-core';

import {
  BasenameContext,
  Config,
  ConfigContext,
  useAuth,
  useConfig,
} from '@rhoas/app-services-ui-shared';

import { AlertsProvider } from './Alerts';
import { AppLayout } from './AppLayout';
import { CosRoutes } from './CosRoutes';
import {
  getKeycloakInstance,
  KeycloakAuthProvider,
  KeycloakContext,
} from './Keycloak';
import { Loading } from './Loading';
import i18n from './i18n';

let keycloak: Keycloak.KeycloakInstance | undefined;

/**
 * Initializes the COS UI with an app that mimicks the console.redhat.com
 * experience.
 *
 * It uses Keycloak to authenticate the user against sso.redhat.com.
 * For it to work it requires the dev server to run at address
 * https://prod.foo.redhat.com:1337.
 *
 * The `baseUrl` for the API can be specified setting the `BASE_PATH` env
 * variable.
 */
export const AppDemo: FunctionComponent = () => {
  const [initialized, setInitialized] = useState(false);

  const getBasename = useCallback(() => '/', []);

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
            'https://dbz-ui.apps.kammellol.rhmw-integrations.net/dbz-connector-configurator.remoteEntry.js',
          scope: 'debezium_ui',
          module: './config',
        },
        'debezium-mysql-1.5.0.Final': {
          remoteEntry:
            'https://dbz-ui.apps.kammellol.rhmw-integrations.net/dbz-connector-configurator.remoteEntry.js',
          scope: 'debezium_ui',
          module: './config',
        },
        'debezium-postgres-1.5.0.Final': {
          remoteEntry:
            'https://dbz-ui.apps.kammellol.rhmw-integrations.net/dbz-connector-configurator.remoteEntry.js',
          scope: 'debezium_ui',
          module: './config',
        },
      } as Record<string, unknown>,
    },
  } as Config;

  return (
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <BasenameContext.Provider value={{ getBasename }}>
          <ConfigContext.Provider value={config}>
            <I18nextProvider i18n={i18n}>
              <AlertsProvider>
                <React.Suspense fallback={<Loading />}>
                  <Router>
                    <AppLayout>
                      {initialized ? <ConnectedRoutes /> : <Spinner />}
                    </AppLayout>
                  </Router>
                </React.Suspense>
              </AlertsProvider>
            </I18nextProvider>
          </ConfigContext.Provider>
        </BasenameContext.Provider>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};
const ConnectedRoutes = () => {
  const auth = useAuth();
  const config = useConfig();

  return (
    <CosRoutes
      getToken={async () => (await auth?.kas.getToken()) || ''}
      connectorsApiBasePath={config?.cos.apiBasePath || ''}
      // TODO: remove after demo
      kafkaManagementApiBasePath={'https://api.openshift.com'}
    />
  );
};
