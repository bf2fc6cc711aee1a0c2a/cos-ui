import {
  BasenameContext,
  Config,
  ConfigContext,
  useAuth,
  useConfig
} from '@bf2/ui-shared';
import { Spinner } from '@patternfly/react-core';
import Keycloak from 'keycloak-js';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import { AlertProvider } from './AlertContext';
import { AppLayout } from './AppLayout';
import { CosUiRoutes } from './CosUiRoutes';
import i18n from './i18n';
import {
  getKeycloakInstance,
  KeycloakAuthProvider,
  KeycloakContext
} from './Keycloak';
import { Loading } from './Loading';


let keycloak: Keycloak.KeycloakInstance | undefined;

export const DemoApp: FunctionComponent = () => {
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
              <AlertProvider>
                <React.Suspense fallback={<Loading />}>
                  <Router>
                    <AppLayout>
                      {initialized ? <ConnectedRoutes /> : <Spinner />}
                    </AppLayout>
                  </Router>
                </React.Suspense>
              </AlertProvider>
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
    <CosUiRoutes getToken={auth?.kas.getToken || (() => Promise.resolve(''))} apiBasepath={config?.cos.apiBasePath || ''} />
  );
};
