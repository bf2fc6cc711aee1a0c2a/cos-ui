import React, { FunctionComponent } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { AppContextProvider } from './AppContext';
import { ConnectedConnectorsPage, CreateConnectorPage } from './pages';

type CosUiRoutesProps = {
  getToken: () => Promise<string>;
  apiBasepath: string;
};

export const CosUiRoutes: FunctionComponent<CosUiRoutesProps> = ({
  getToken,
  apiBasepath,
}) => {
  const history = useHistory();
  const goToConnectorsList = () => history.push('/');
  const goToCreateConnector = () => history.push('/create-connector');
  const onConnectorSave = () => {
    // TODO: success notification
    goToConnectorsList();
  };
  return (
    <AppContextProvider getToken={getToken} basePath={apiBasepath}>
      <Switch>
        <Route path={'/'} exact>
          <ConnectedConnectorsPage onCreateConnector={goToCreateConnector} />
        </Route>
        <Route path={'/create-connector'}>
          <CreateConnectorPage
            onSave={onConnectorSave}
            onClose={goToConnectorsList}
          />
        </Route>
      </Switch>
    </AppContextProvider>
  );
};
