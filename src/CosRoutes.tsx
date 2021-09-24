import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useHistory } from 'react-router-dom';

import { AlertVariant, useAlert } from '@rhoas/app-services-ui-shared';

import { ConnectedConnectorsPage } from './ConnectorsPage';
import { CosContextProvider } from './CosContext';
import { CreateConnectorPage } from './CreateConnectorPage';

type CosRoutesProps = {
  getToken: () => Promise<string>;
  apiBasepath: string;
};

export const CosRoutes: FunctionComponent<CosRoutesProps> = ({
  getToken,
  apiBasepath,
}) => {
  const { t } = useTranslation();
  const alert = useAlert();
  const history = useHistory();
  const goToConnectorsList = useCallback(() => history.push('/'), [history]);
  const goToCreateConnector = useCallback(
    () => history.push('/create-connector'),
    [history]
  );
  const onConnectorSave = useCallback(() => {
    alert?.addAlert({
      id: 'connector-created',
      variant: AlertVariant.success,
      title: t('wizard.creation-success'),
    });
    goToConnectorsList();
  }, [alert, goToConnectorsList, t]);
  return (
    <CosContextProvider getToken={getToken} basePath={apiBasepath}>
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
    </CosContextProvider>
  );
};
