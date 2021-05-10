import React, { FunctionComponent } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './Routes';

type FederatedAppProps = {
  getUsername: Promise<string>;
  getToken: Promise<string>;
  basename: string;
};

export const FederatedApp: FunctionComponent<FederatedAppProps> = ({
  getToken,
  basename,
}) => (
  <Router basename={basename}>
    <Routes getToken={getToken} />
  </Router>
);
