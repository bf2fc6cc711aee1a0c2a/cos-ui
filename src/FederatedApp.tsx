import React, { FunctionComponent } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import { useAuth, useBasename, useConfig } from '@bf2/ui-shared';

import { CosUiRoutes } from './CosUiRoutes';
import { Loading } from './Loading';
import i18n from './i18n';

export const FederatedApp: FunctionComponent = () => {
  const config = useConfig();
  const auth = useAuth();
  const basename = useBasename();
  return (
    <I18nextProvider i18n={i18n}>
      <React.Suspense fallback={<Loading />}>
        <Router basename={basename?.getBasename()}>
          <CosUiRoutes
            getToken={auth?.kas.getToken || (() => Promise.resolve(''))}
            apiBasepath={config?.cos.apiBasePath || ''}
          />
        </Router>
      </React.Suspense>
    </I18nextProvider>
  );
};
