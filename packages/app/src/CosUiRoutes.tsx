import React, { FunctionComponent } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { useConfig } from '@bf2/ui-shared';
import { CreationWizard } from '@cos-ui/creation-wizard';
import { CreationWizardMachineProvider } from '@cos-ui/machines';
import { PageSection } from '@patternfly/react-core';

import { AppContextProvider } from './AppContext';
import { ConnectedConnectorsPage } from './ConnectorsPage';
import { fetchConfigurator } from './FederatedConfigurator';

type CosUiRoutesProps = {
  getToken: () => Promise<string>;
  apiBasepath: string;
};

export const CosUiRoutes: FunctionComponent<CosUiRoutesProps> = ({
  getToken,
  apiBasepath,
}) => {
  const { cos } = useConfig();
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
              accessToken={getToken}
              basePath={apiBasepath}
              fetchConfigurator={connector =>
                fetchConfigurator(connector, cos.configurators)
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
