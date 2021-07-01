import { AlertVariant, useAlert } from '@bf2/ui-shared';
import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const history = useHistory();
  const goToConnectorsList = useCallback(() => history.push('/'), [history]);
  const goToCreateConnector = useCallback(
    () => history.push('/create-connector'),
    [history]
  );
  const onConnectorSave = useCallback(() => {
    addAlert({
      id: 'connector-created',
      variant: AlertVariant.success,
      title: t('wizard.creation-success'),
    });
    goToConnectorsList();
  }, [addAlert, goToConnectorsList, t]);
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
