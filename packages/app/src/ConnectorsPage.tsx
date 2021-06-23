import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { Connector } from '@cos-ui/api';
import {
  ConnectorsMachineProvider,
  useConnectorsMachine,
  useConnectorsMachineIsReady,
  useConnectorsMachineService,
} from '@cos-ui/machines';
import {
  EmptyState,
  EmptyStateVariant,
  Loading,
  NoMatchFound,
} from '@cos-ui/utils';
import {
  ButtonVariant,
  PageSection,
  TextContent,
  Title,
} from '@patternfly/react-core';

import { useAppContext } from './AppContext';
import { ConnectorDrawer } from './ConnectorDrawer';
import { ConnectorsToolbar, ConnectorTableView } from './ConnectorTableView';

export const ConnectedConnectorsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { basePath, authToken } = useAppContext();
  const [
    selectedConnectors,
    setSelectedConnectors,
  ] = useState<Connector | null>(null);
  const [activeRow, setActiveRow] = useState('');
  const onDrawerClose = () => {
    setSelectedConnectors(null);
    setActiveRow('');
  };
  return (
    <ConnectorsMachineProvider accessToken={authToken} basePath={basePath}>
      <ConnectorDrawer
        isExpanded={selectedConnectors != null}
        selectedConnectors={selectedConnectors}
        onClose={onDrawerClose}
      >
        <PageSection variant={'light'}>
          <TextContent>
            <Title headingLevel="h1">{t('managedConnectors')}</Title>
          </TextContent>
        </PageSection>
        <PageSection variant={'light'} padding={{ default: 'noPadding' }}>
          <ConnectorsPage
            selectConnector={setSelectedConnectors}
            activeRow={activeRow}
            setActiveRow={setActiveRow}
          />
        </PageSection>
      </ConnectorDrawer>
    </ConnectorsMachineProvider>
  );
};

export type ConnectorsPageProps = {
  selectConnector: (conn: Connector | null) => void;
  activeRow: string;
  setActiveRow: (currentRow: string) => void;
};

export const ConnectorsPage: FunctionComponent<ConnectorsPageProps> = ({
  activeRow,
  setActiveRow,
  selectConnector,
}: ConnectorsPageProps) => {
  const service = useConnectorsMachineService();
  const isReady = useConnectorsMachineIsReady(service);
  return isReady ? (
    <ConnectorsTable
      selectConnector={selectConnector}
      activeRow={activeRow}
      setActiveRow={setActiveRow}
    />
  ) : null;
};

export type ConnectorsTableProps = {
  selectConnector: (conn: Connector | null) => void;
  activeRow: string;
  setActiveRow: (currentRow: string) => void;
};

const ConnectorsTable: FunctionComponent<ConnectorsTableProps> = ({
  activeRow,
  setActiveRow,
  selectConnector,
}: ConnectorsTableProps) => {
  const history = useHistory();
  const service = useConnectorsMachineService();
  const {
    response,
    loading,
    error,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
  } = useConnectorsMachine(service);

  switch (true) {
    case firstRequest:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <Loading />
        </PageSection>
      );
    case queryEmpty:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <NoMatchFound
            onClear={() => service.send({ type: 'query', page: 1, size: 10 })}
          />
        </PageSection>
      );
    case loading:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <ConnectorsToolbar />
          <Loading />
        </PageSection>
      );
    case noResults || error:
      return (
        <EmptyState
          emptyStateProps={{ variant: EmptyStateVariant.GettingStarted }}
          titleProps={{ title: 'cos.welcome_to_cos' }}
          emptyStateBodyProps={{
            body: 'cos.welcome_empty_state_body',
          }}
          buttonProps={{
            title: 'cos.create_cos',
            variant: ButtonVariant.primary,
            onClick: () => history.push('/create-connector'),
          }}
        />
      );
    default:
      return (
        <ConnectorTableView
          data={response}
          selectConnector={selectConnector}
          activeRow={activeRow}
          setActiveRow={setActiveRow}
        />
      );
  }
};
