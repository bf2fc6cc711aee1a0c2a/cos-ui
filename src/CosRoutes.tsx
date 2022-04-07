import { ConnectorDetailsPage } from '@app/pages/ConnectorDetailsPage/ConnectorDetailsPage';
import { ConnectedConnectorsPage } from '@app/pages/ConnectorsPage/ConnectorsPage';
import { CreateConnectorPage } from '@app/pages/CreateConnectorPage/CreateConnectorPage';
import { DuplicateConnectorPage } from '@app/pages/CreateConnectorPage/DuplicateConnectorPage';
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
  const goToConnectorDetails = useCallback(
    (id: string, targetTab: string) =>
      history.push({
        pathname: `/${id}`,
        hash: `#${targetTab}`,
      }),
    [history]
  );
  const goToDuplicateConnector = useCallback(
    (id: string) =>
      history.push({
        pathname: `/duplicate-connector`,
        hash: `#${id}`,
      }),
    [history]
  );

  const onConnectorSave = useCallback(
    (name: string) => {
      alert?.addAlert({
        id: 'connector-created',
        variant: AlertVariant.success,
        title: t('creationSuccessAlertTitle'),
        description: t('creationSuccessAlertDescription', { name }),
      });
      goToConnectorsList();
    },
    [alert, goToConnectorsList, t]
  );
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
            onConnectorDetail={goToConnectorDetails}
            onDuplicateConnector={goToDuplicateConnector}
          />
        </Route>
        <Route path={'/create-connector'}>
          <CreateConnectorPage
            onSave={onConnectorSave}
            onClose={goToConnectorsList}
          />
        </Route>
        <Route path={'/duplicate-connector'}>
          <DuplicateConnectorPage
            onSave={onConnectorSave}
            onClose={goToConnectorsList}
          />
        </Route>
        <Route path={'/:id/'}>
          <ConnectorDetailsPage onSave={goToConnectorsList} />
        </Route>
      </Switch>
    </CosContextProvider>
  );
};
