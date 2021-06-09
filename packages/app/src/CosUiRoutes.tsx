import { CreationWizard } from '@cos-ui/creation-wizard';
import { CreationWizardMachineProvider } from '@cos-ui/machines';
import { PageSection, TextContent, Title } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { AppContextProvider } from './AppContext';
import { ConnectedConnectorsPage } from './ConnectorsPage';
import { fetchConfigurator } from './FederatedConfigurator';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import { Loading } from '@cos-ui/utils';

type CosUiRoutesProps = {
  getToken: Promise<string>;
  apiBasepath: string;
};

export const CosUiRoutes: FunctionComponent<CosUiRoutesProps> = ({
  getToken,
  apiBasepath,
}) => {
  const history = useHistory();
  const { t } = useTranslation();
  const goToConnectorsList = () => history.push('/');
  return (
    <I18nextProvider i18n={i18n}>
      <React.Suspense fallback={<Loading />}>
        <AppContextProvider authToken={getToken} basePath={apiBasepath}>
          <Switch>
            <Route path={'/'} exact>
              <PageSection variant={'light'}>
                <TextContent>
                  <Title headingLevel="h1">{t('managedConnectors')}</Title>
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
                  basePath={apiBasepath}
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
      </React.Suspense>
    </I18nextProvider>
  );
};
