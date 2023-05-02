import { Loading } from '@app/components/Loading/Loading';
import { init } from '@app/store';
import {
  APP_ROUTE,
  DEBEZIUM_CONFIGURATOR,
  DEBEZIUM_CONFIGURATOR_PREVIEW,
  ENDPOINT_MAPPINGS,
  PREVIEW_APP_ROUTE,
  PROD_BASE_PATH,
} from '@constants/endpoints';
import { AlertContext, AlertProps } from '@hooks/useAlert';
import { AnalyticsProvider } from '@hooks/useAnalytics';
import i18n from '@i18n/i18n';
import NotificationPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import type { Reducer } from 'redux';

import '@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css';

import { I18nextProvider } from '@rhoas/app-services-ui-components';

import { CosRoutes } from './CosRoutes';

/**
 * Initializes the COS UI without any chrome. This is meant to be used in
 * production, or locally when consuming this component as a federated module
 * served by the [`application-services-ui`](https://gitlab.cee.redhat.com/mk-ci-cd/application-services-u)
 * app.
 *
 * The auth token and the API basePath will come from the relative context set
 * up in the `application-services-ui` app.
 */
const AppFederatedInner: FunctionComponent = () => {
  const [key, setKey] = useState(0);
  const { analytics, auth, isBeta, on } = useChrome();
  const dispatch = useDispatch();

  const bumpKey = useCallback(() => {
    setKey(key + 1);
  }, [key, setKey]);

  useEffect(() => {
    // Connect toast notifications
    const registry = getRegistry();
    registry.register({
      notifications: notificationsReducer as Reducer,
    });

    // force our router instance to refresh it's history state when there's a
    // side navigation event
    const unregister = on('APP_NAVIGATION', (event) => {
      if (event.navId === 'connectors') {
        bumpKey();
      }
    });
    return () => {
      unregister!();
    };
  }, [on, bumpKey]);

  // Connect toast notifications to console dot
  const addAlert = ({
    title,
    variant,
    description,
    dismissable,
    id,
  }: AlertProps) => {
    console.log(
      'dispatching addNotification action, title: ',
      title,
      ' variant: ',
      variant,
      ' description: ',
      description,
      ' dismissable: ',
      dismissable
    );
    dispatch(
      addNotification({
        title,
        variant,
        description,
        dismissable: dismissable || true,
        id,
      })
    );
  };
  const { cosManagementApiBasePath, kafkaManagementApiBasePath } =
    ENDPOINT_MAPPINGS.find(
      ({ hostnames }: { hostnames: ReadonlyArray<string> }) =>
        hostnames.includes(window.location.hostname)
    ) || {
      cosManagementApiBasePath: PROD_BASE_PATH,
      kafkaManagementApiBasePath: PROD_BASE_PATH,
    };
  return (
    <AlertContext.Provider value={{ addAlert }}>
      <React.Suspense fallback={<Loading />}>
        <AnalyticsProvider
          onActivity={(event, properties) =>
            analytics ? analytics.track(event, properties) : false
          }
        >
          <Router basename={isBeta() ? PREVIEW_APP_ROUTE : APP_ROUTE} key={key}>
            <NotificationPortal />
            <CosRoutes
              getToken={async () => (await auth.getToken()) || ''}
              connectorsApiBasePath={
                (process.env.COS_MGMT_URL || cosManagementApiBasePath)!
              }
              kafkaManagementApiBasePath={
                (process.env.KAS_MGMT_URL || kafkaManagementApiBasePath)!
              }
              configurators={{
                debezium: {
                  remoteEntry: isBeta()
                    ? DEBEZIUM_CONFIGURATOR_PREVIEW
                    : DEBEZIUM_CONFIGURATOR,
                  scope: 'debezium_ui',
                  module: './config',
                },
              }}
            />
          </Router>
        </AnalyticsProvider>
      </React.Suspense>
    </AlertContext.Provider>
  );
};

export const AppFederated: FunctionComponent = () => {
  return (
    <Provider store={init().getStore()}>
      <I18nextProvider i18n={i18n}>
        <AppFederatedInner />
      </I18nextProvider>
    </Provider>
  );
};

export default AppFederated;
