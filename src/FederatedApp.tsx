import React, { FunctionComponent } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import { useAuth, useBasename, useConfig } from '@bf2/ui-shared';

import { CosUiRoutes } from './CosUiRoutes';
import i18n from './i18n';
import { Loading } from './Loading';

export const FederatedApp: FunctionComponent = () => {
  const { cos } = useConfig();
  const { kas } = useAuth();
  const { getBasename } = useBasename();
  return (
    <I18nextProvider i18n={i18n}>
      <React.Suspense fallback={<Loading />}>
        <Router basename={getBasename()}>
          <CosUiRoutes getToken={kas.getToken} apiBasepath={cos.apiBasePath} />
        </Router>
      </React.Suspense>
    </I18nextProvider>
  );
};
