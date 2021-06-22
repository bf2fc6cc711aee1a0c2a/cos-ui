import { CreationWizard } from '@cos-ui/creation-wizard';
import { CreationWizardMachineProvider } from '@cos-ui/machines';
import { PageSection } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { AppContextProvider } from './AppContext';
import { ConnectedConnectorsPage } from './ConnectorsPage';
import { fetchConfigurator } from './FederatedConfigurator';

type CosUiRoutesProps = {
  getToken: Promise<string>;
  apiBasepath: string;
};

export const CosUiRoutes: FunctionComponent<CosUiRoutesProps> = ({
  getToken,
  apiBasepath,
}) => {
  const history = useHistory();
  const goToConnectorsList = () => history.push('/');
  return (
    <AppContextProvider authToken={getToken} basePath={apiBasepath}>
      <Switch>
        <Route path={'/'} exact>
          <ConnectedConnectorsPage />
        </Route>
        <Route path={'/create-connector'}>
          <PageSection padding={{ default: 'noPadding' }}>
            <CreationWizardMachineProvider
              authToken={getToken}
              basePath={apiBasepath}
              fetchConfigurator={connector =>
                fetchConfigurator(
                  connector,
                  process.env.FEDERATED_CONFIGURATORS_CONFIG_URL ||
                    'federated-configurators.json'
                )
              }
              onSave={goToConnectorsList}
            >
              <CreationWizard onClose={goToConnectorsList} />
            </CreationWizardMachineProvider>
          </PageSection>
        </Route>
      </Switch>
    </AppContextProvider>
  );
};
