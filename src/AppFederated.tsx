import { Loading } from '@app/components/Loading/Loading';
import i18n from '@i18n/i18n';
import React, { FunctionComponent } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import { useAuth, useBasename, useConfig } from '@rhoas/app-services-ui-shared';

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
export const AppFederated: FunctionComponent = () => {
  const config = useConfig();
  const auth = useAuth();
  const basename = useBasename();
  return (
    <I18nextProvider i18n={i18n}>
      <React.Suspense fallback={<Loading />}>
        <Router basename={basename?.getBasename()}>
          <CosRoutes
            getToken={async () => (await auth?.kas.getToken()) || ''}
            connectorsApiBasePath={config?.cos.apiBasePath || ''}
            // TODO: remove after demo
            kafkaManagementApiBasePath={'https://api.openshift.com'}
          />
        </Router>
      </React.Suspense>
    </I18nextProvider>
  );
};

export default AppFederated;
