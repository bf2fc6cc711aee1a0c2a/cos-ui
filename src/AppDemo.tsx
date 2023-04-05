import { AlertsProvider } from '@app/components/Alerts/Alerts';
import { AppLayout } from '@app/components/AppLayout/AppLayout';
import { Loading } from '@app/components/Loading/Loading';
import { AnalyticsProvider } from '@hooks/useAnalytics';
import i18n from '@i18n/i18n';
import Keycloak from 'keycloak-js';
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  Spinner,
} from '@patternfly/react-core';

import { I18nextProvider } from '@rhoas/app-services-ui-components';
import {
  Config,
  ConfigContext,
  useAuth,
  useConfig,
} from '@rhoas/app-services-ui-shared';

import { CosRoutes } from './CosRoutes';
import {
  getKeycloakInstance,
  KeycloakAuthProvider,
  KeycloakContext,
} from './Keycloak';

let keycloak: Keycloak.KeycloakInstance | undefined;

type EnvironmentType = 'staging' | 'development' | 'local';
const environmentNames = ['staging', 'development', 'local'] as const;
const environments: { [k in EnvironmentType]: string } = {
  staging: 'https://wxn4aqqc8bqvxcy6unfe.api.stage.openshift.com',
  development:
    'https://cos-fleet-manager-managed-connectors-dev.rhoc-dev-153f1de160110098c1928a6c05e19444-0000.eu-de.containers.appdomain.cloud',
  local: 'http://localhost:8000',
};

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const storedEnvironmentName =
    (localStorage.getItem('environment') as EnvironmentType) || 'staging';
  const currentEnvironment = environments[storedEnvironmentName];
  const baseUrl = (currentEnvironment || process.env.BASE_PATH)!;

  // Initialize the client
  useEffect(() => {
    const init = async () => {
      keycloak = await getKeycloakInstance();
      setInitialized(true);
    };
    init();
  }, []);

  const switchEnvironment = (name?: EnvironmentType) => {
    setIsOpen(false);
    if (typeof name === 'undefined') {
      localStorage.removeItem('environment');
    } else {
      localStorage.setItem('environment', name);
    }
    window.location.reload();
  };

  const environmentDropdown = (
    <Dropdown
      isOpen={isOpen}
      isPlain
      toggle={
        <DropdownToggle onToggle={() => setIsOpen(!isOpen)}>
          {storedEnvironmentName}
        </DropdownToggle>
      }
      position={DropdownPosition.right}
      dropdownItems={[
        ...environmentNames.map((name) => (
          <DropdownItem
            checked={name === storedEnvironmentName}
            key={name}
            onClick={() => switchEnvironment(name)}
          >
            {name}
          </DropdownItem>
        )),
        <DropdownItem key={'clear'} onClick={() => switchEnvironment()}>
          Clear Stored Environment
        </DropdownItem>,
      ]}
    />
  );

  return (
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <ConnectedAppDemo
          baseUrl={baseUrl}
          initialized={initialized}
          headerTools={environmentDropdown}
        />
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};

type ConnectedAppDemoProps = {
  baseUrl: string;
  initialized: boolean;
  headerTools: ReactNode;
};
const ConnectedAppDemo: FunctionComponent<ConnectedAppDemoProps> = ({
  baseUrl,
  headerTools,
  initialized,
}) => (
  <ConfigContext.Provider
    value={
      {
        cos: {
          apiBasePath: baseUrl,
          configurators: {
            debezium: {
              remoteEntry:
                'https://qaprodauth.cloud.redhat.com/apps/dbz-ui-build/dbz-connector-configurator.remoteEntry.js',
              scope: 'debezium_ui',
              module: './config',
            },
          } as Record<string, unknown>,
        },
      } as Config
    }
  >
    <I18nextProvider i18n={i18n}>
      <AlertsProvider>
        <AnalyticsProvider>
          <React.Suspense fallback={<Loading />}>
            <Router>
              <AppLayout headerTools={headerTools}>
                {initialized ? <ConnectedRoutes /> : <Spinner />}
              </AppLayout>
            </Router>
          </React.Suspense>
        </AnalyticsProvider>
      </AlertsProvider>
    </I18nextProvider>
  </ConfigContext.Provider>
);

const ConnectedRoutes: FunctionComponent<{}> = () => {
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
