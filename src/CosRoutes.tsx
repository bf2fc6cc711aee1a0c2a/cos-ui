import { ConnectedConnectorsPage } from '@app/pages/ConnectorsPage/ConnectorsPage';
import { CreateConnectorPage } from '@app/pages/CreateConnectorPage/CreateConnectorPage';
import { ConnectorDetailsPage } from '@app/pages/EditConnectorPage/ConnectorDetailsPage';
import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useHistory } from 'react-router-dom';

import { AlertVariant, useAlert } from '@rhoas/app-services-ui-shared';

import { CosContextProvider } from './context/CosContext';

type CosRoutesProps = {
  getToken: () => Promise<string>;
  connectorsApiBasePath: string;
  kafkaManagementApiBasePath: string;
};

export const CosRoutes: FunctionComponent<CosRoutesProps> = ({
  getToken,
  connectorsApiBasePath,
  kafkaManagementApiBasePath,
}) => {
  const { t } = useTranslation();
  const alert = useAlert();
  const history = useHistory();
  const goToConnectorsList = useCallback(() => history.push('/'), [history]);
  const goToCreateConnector = useCallback(
    () => history.push('/create-connector'),
    [history]
  );

  const goToEditConnector = useCallback(
    (id: string, name: string, currentState: string) =>
      history.push({
        pathname: `/${id}`,
        state: {
          name: name,
          currentState: currentState,
        },
      }),
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
    <CosContextProvider
      getToken={getToken}
      connectorsApiBasePath={connectorsApiBasePath}
      kafkaManagementApiBasePath={kafkaManagementApiBasePath}
    >
      <Switch>
        <Route path={'/'} exact>
          <ConnectedConnectorsPage
            onCreateConnector={goToCreateConnector}
            onEditConnector={goToEditConnector}
          />
        </Route>
        <Route path={'/create-connector'}>
          <CreateConnectorPage
            onSave={onConnectorSave}
            onClose={goToConnectorsList}
          />
        </Route>
        <Route path={'/:id'}>
          <ConnectorDetailsPage />
        </Route>
      </Switch>
    </CosContextProvider>
  );
};
