import React, { FunctionComponent, useCallback } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  Auth,
  AuthContext,
  BasenameContext,
  Config,
  ConfigContext,
  useAuth,
  useConfig,
} from '@rhoas/app-services-ui-shared';

import { AlertsProvider } from './Alerts';
import { AppLayout } from './AppLayout';
import { CosRoutes } from './CosRoutes';
import { Loading } from './Loading';
import i18n from './i18n';

/**
 * Initializes the COS UI with an app that mimicks the console.redhat.com
 * experience without any authentication, to allow E2E tests to be run by a CI
 * pipeline.
 *
 * The `baseUrl` for the API is statically set to `localhost`.
 */
export const AppE2E: FunctionComponent = () => {
  const getBasename = useCallback(() => '/', []);

  const config = {
    cos: {
      apiBasePath: 'localhost',
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

  const authTokenContext = {
    kas: {
      getToken: () => Promise.resolve('dummy'),
    },
    getUsername: () => Promise.resolve('username'),
  } as Auth;

  return (
    <AuthContext.Provider value={authTokenContext}>
      <BasenameContext.Provider value={{ getBasename }}>
        <ConfigContext.Provider value={config}>
          <I18nextProvider i18n={i18n}>
            <AlertsProvider>
              <React.Suspense fallback={<Loading />}>
                <Router>
                  <AppLayout>
                    <ConnectedRoutes />
                  </AppLayout>
                </Router>
              </React.Suspense>
            </AlertsProvider>
          </I18nextProvider>
        </ConfigContext.Provider>
      </BasenameContext.Provider>
    </AuthContext.Provider>
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
