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
} from '@bf2/ui-shared';

import { AlertProvider } from './AlertContext';
import { AppLayout } from './AppLayout';
import { CosUiRoutes } from './CosUiRoutes';
import { Loading } from './Loading';
import i18n from './i18n';

export const E2EApp: FunctionComponent = () => {
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
            <AlertProvider>
              <React.Suspense fallback={<Loading />}>
                <Router>
                  <AppLayout>
                    <ConnectedRoutes />
                  </AppLayout>
                </Router>
              </React.Suspense>
            </AlertProvider>
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
    <CosUiRoutes
      getToken={auth?.kas.getToken || (() => Promise.resolve(''))}
      apiBasepath={config?.cos.apiBasePath || ''}
    />
  );
};
