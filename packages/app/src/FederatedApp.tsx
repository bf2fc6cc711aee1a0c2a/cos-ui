import React, { FunctionComponent } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
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
  <Router basename={urlBasename}>
    <CosUiRoutes getToken={getToken} apiBasepath={apiBasepath} />
  </Router>
);
