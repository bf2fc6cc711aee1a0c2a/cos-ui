import { Loading } from '@app/components/Loading/Loading';
import { init } from '@app/store';
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
import { useConfig } from '@rhoas/app-services-ui-shared';

import { CosRoutes } from './CosRoutes';

// The route within the console.redhat.com environment that this app sits at
const APP_ROUTE = '/application-services/connectors';
// The preview/beta route within console.redhat.com
const PREVIEW_APP_ROUTE = '/beta/application-services/connectors';
// The root URL for the kafka management API
const KAFKA_MANAGEMENT_API_BASE_PATH = 'https://api.openshift.com';

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
  const config = useConfig();
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
              connectorsApiBasePath={config?.cos.apiBasePath || ''}
              kafkaManagementApiBasePath={KAFKA_MANAGEMENT_API_BASE_PATH}
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
