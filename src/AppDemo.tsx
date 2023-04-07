import { AlertsProvider } from '@app/components/Alerts/Alerts';
import { AppLayout } from '@app/components/AppLayout/AppLayout';
import { Loading } from '@app/components/Loading/Loading';
import {
  COS_MANAGEMENT_DEV_BASE_PATH,
  DEBEZIUM_CONFIGURATOR,
  PROD_BASE_PATH,
  STAGE_BASE_PATH,
} from '@constants/endpoints';
import { AnalyticsProvider } from '@hooks/useAnalytics';
import {
  getKeycloakInstance,
  KeycloakContext,
  useKeyCloakAuthToken,
} from '@hooks/useKeycloak';
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

import { CosRoutes } from './CosRoutes';

let keycloak: Keycloak.KeycloakInstance | undefined;

type EnvironmentType = 'staging' | 'development' | 'local';
const environmentNames = ['staging', 'development', 'local'] as const;
const environments: { [k in EnvironmentType]: string } = {
  staging: STAGE_BASE_PATH,
  development: COS_MANAGEMENT_DEV_BASE_PATH,
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
      <ConnectedAppDemo
        baseUrl={baseUrl}
        initialized={initialized}
        headerTools={environmentDropdown}
      />
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
  <I18nextProvider i18n={i18n}>
    <AlertsProvider>
      <AnalyticsProvider>
        <React.Suspense fallback={<Loading />}>
          <Router>
            <AppLayout headerTools={headerTools}>
              {initialized ? (
                <ConnectedRoutes baseUrl={baseUrl} />
              ) : (
                <Spinner />
              )}
            </AppLayout>
          </Router>
        </React.Suspense>
      </AnalyticsProvider>
    </AlertsProvider>
  </I18nextProvider>
);

type ConnectedRoutesProps = {
  baseUrl: string;
};
const ConnectedRoutes: FunctionComponent<ConnectedRoutesProps> = ({
  baseUrl,
}) => {
  const { getKeyCloakToken } = useKeyCloakAuthToken();
  return (
    <CosRoutes
      getToken={async () => (await getKeyCloakToken()) || ''}
      connectorsApiBasePath={baseUrl || ''}
      kafkaManagementApiBasePath={PROD_BASE_PATH}
      configurators={{
        debezium: {
          remoteEntry: DEBEZIUM_CONFIGURATOR,
          scope: 'debezium_ui',
          module: './config',
        },
      }}
    />
  );
};
