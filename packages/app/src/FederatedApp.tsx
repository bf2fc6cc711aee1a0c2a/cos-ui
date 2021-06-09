import React, { FunctionComponent } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Loading } from '@cos-ui/utils';
import i18n from './i18n';
import { CosUiRoutes } from './CosUiRoutes';

type FederatedAppProps = {
  getUsername: Promise<string>;
  getToken: Promise<string>;
  urlBasename: string;
  apiBasepath: string;
};

export const FederatedApp: FunctionComponent<FederatedAppProps> = ({
  getToken,
  urlBasename,
  apiBasepath,
}) => (
  <I18nextProvider i18n={i18n}>
    <React.Suspense fallback={<Loading />}>
      <Router basename={urlBasename}>
        <CosUiRoutes getToken={getToken} apiBasepath={apiBasepath} />
      </Router>
    </React.Suspense>
  </I18nextProvider>
);
