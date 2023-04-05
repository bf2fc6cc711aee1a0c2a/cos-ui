import { Loading } from '@app/components/Loading/Loading';
import { AnalyticsProvider } from '@hooks/useAnalytics';
import i18n from '@i18n/i18n';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import '@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css';

import { I18nextProvider } from '@rhoas/app-services-ui-components';
import { useAuth, useConfig } from '@rhoas/app-services-ui-shared';

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
export const AppFederated: FunctionComponent = () => {
  const config = useConfig();
  const auth = useAuth();
  const [key, setKey] = useState(0);
  const chrome = useChrome();
  const analytics = chrome.analytics;
  const bumpKey = useCallback(() => {
    setKey(key + 1);
  }, [key, setKey]);
  // force our router instance to refresh it's history state when there's a
  // side navigation event
  useEffect(() => {
    const unregister = chrome
      ? chrome.on('APP_NAVIGATION', (event) => {
          if (event.navId === 'connectors') {
            bumpKey();
          }
        })
      : () => {};
    return () => {
      unregister!();
    };
  });
  return (
    <I18nextProvider i18n={i18n}>
      <AnalyticsProvider
        onActivity={(event, properties) =>
          analytics ? analytics.track(event, properties) : false
        }
      >
        <React.Suspense fallback={<Loading />}>
          <Router
            basename={chrome.isBeta() ? PREVIEW_APP_ROUTE : APP_ROUTE}
            key={key}
          >
            <CosRoutes
              getToken={async () => (await auth?.kas.getToken()) || ''}
              connectorsApiBasePath={config?.cos.apiBasePath || ''}
              kafkaManagementApiBasePath={KAFKA_MANAGEMENT_API_BASE_PATH}
            />
          </Router>
        </React.Suspense>
      </AnalyticsProvider>
    </I18nextProvider>
  );
};

export default AppFederated;
