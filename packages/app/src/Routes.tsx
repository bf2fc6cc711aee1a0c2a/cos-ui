import {
  CreationWizard,
  CreationWizardMachineProvider,
} from '@cos-ui/creation-wizard';
import { PageSection, TextContent, Title } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { AppContextProvider } from './AppContext';
import { ConnectedConnectorsPage } from './ConnectorsPage';
import { fetchConfigurator } from './FederatedConfigurator';

type RoutesProps = {
  getToken: Promise<string>;
};
const basePath = process.env.BASE_PATH;

export const Routes: FunctionComponent<RoutesProps> = ({ getToken }) => {
  const history = useHistory();
  const goToConnectorsList = () => history.push('/');
  return (
    <AppContextProvider authToken={getToken} basePath={basePath}>
      <Switch>
        <Route path={'/'} exact>
          <PageSection variant={'light'}>
            <TextContent>
              <Title headingLevel="h1">Managed Connectors</Title>
            </TextContent>
          </PageSection>
          <PageSection variant={'light'} padding={{ default: 'noPadding' }}>
            <ConnectedConnectorsPage />
          </PageSection>
        </Route>
        <Route path={'/create-connector'}>
          <PageSection padding={{ default: 'noPadding' }}>
            <CreationWizardMachineProvider
              authToken={getToken}
              basePath={process.env.BASE_PATH}
              fetchConfigurator={connector =>
                fetchConfigurator(
                  connector,
                  process.env.FEDERATED_CONFIGURATORS_CONFIG_URL ||
                    'federated-configurators.json'
                )
              }
            >
              <CreationWizard
                onClose={goToConnectorsList}
                onSave={goToConnectorsList}
              />
            </CreationWizardMachineProvider>
          </PageSection>
        </Route>
      </Switch>
    </AppContextProvider>
  );
};
