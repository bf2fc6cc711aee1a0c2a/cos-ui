import { EmptyStateFetchError } from '@app/components/EmptyStateFetchError/EmptyStateFetchError';
import { Loading } from '@app/components/Loading/Loading';
import { CONNECTOR_DETAILS_TABS } from '@constants/constants';
import { useCos } from '@hooks/useCos';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

import {
  ConnectorDetailsPageProvider,
  useConnectorDetails,
} from './ConnectorDetailsPageContext';
import { ConfigurationTab } from './components/ConfigurationTab/ConfigurationTab';
import { ConnectorDetailsHeader } from './components/ConnectorDetailsHeader/ConnectorDetailsHeader';
import { OverviewTab } from './components/OverviewTab/OverviewTab';

type ConnectorDetailsPageProps = {
  onSave: () => void;
  onDuplicateConnector: (id: string) => void;
};

/**
 * Page wrapper to set up the detail provider
 */
export const ConnectorDetailsPage: FC<ConnectorDetailsPageProps> = ({
  onSave,
  onDuplicateConnector,
}) => {
  return (
    <ConnectorDetailsPageProvider>
      <ConnectorDetailsPageBody
        onSave={onSave}
        onDuplicateConnector={onDuplicateConnector}
      />
    </ConnectorDetailsPageProvider>
  );
};

/**
 * Page implementation
 */
type ConnectorDetailsPageBodyProps = {
  onSave: () => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorDetailsPageBody: FC<ConnectorDetailsPageBodyProps> = ({
  onSave,
  onDuplicateConnector,
}) => {
  let { hash } = useLocation();
  const history = useHistory();
  const { t } = useTranslation();
  const { connectorsApiBasePath, getToken } = useCos();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(
    getTab(hash)
  );
  const [editMode, setEditMode] = useState<boolean>();
  const {
    connectorData,
    connectorTypeDetails,
    kafkaInstanceDetails,
    setKafkaInstanceDetails,
    fetchError,
  } = useConnectorDetails();

  const updateEditMode = useCallback(
    (editEnable: boolean) => {
      setEditMode(editEnable);
    },
    [setEditMode]
  );

  useEffect(() => {
    if (hash.includes(CONNECTOR_DETAILS_TABS.Configuration)) {
      setEditMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setActiveTabKey(getTab(hash));
  }, [hash]);

  /**
   * Toggle currently active tab
   * @param _event
   * @param tabIndex
   */
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
    history.push(`#${tabIndex}`);
  };
  if (fetchError) {
    return (
      <EmptyStateFetchError
        message={`${fetchError}`}
        buttonText={t('Return')}
        onClick={() => history.push('..')}
      />
    );
  }
  if (!connectorData) {
    return <Loading />;
  }
  return (
    <>
      <ConnectorDetailsHeader
        connectorData={connectorData}
        onDuplicateConnector={onDuplicateConnector}
        accessToken={getToken}
        connectorsApiBasePath={connectorsApiBasePath}
        goToConnectorList={onSave}
        setActiveTabKey={setActiveTabKey}
        updateEditMode={updateEditMode}
        editMode={editMode || false}
      />
      <Tabs
        className={'pf-u-background-color-100'}
        usePageInsets
        activeKey={activeTabKey}
        onSelect={handleTabClick}
      >
        <Tab
          key={CONNECTOR_DETAILS_TABS.Overview}
          eventKey={CONNECTOR_DETAILS_TABS.Overview}
          title={<TabTitleText>{t('overview')}</TabTitleText>}
        >
          <OverviewTab
            connectorData={connectorData}
            setKafkaInstanceDetails={setKafkaInstanceDetails}
            onDuplicateConnector={onDuplicateConnector}
          />
        </Tab>
        <Tab
          key={CONNECTOR_DETAILS_TABS.Configuration}
          eventKey={CONNECTOR_DETAILS_TABS.Configuration}
          title={<TabTitleText>{t('configuration')}</TabTitleText>}
        >
          {connectorTypeDetails ? (
            <ConfigurationTab
              onSave={onSave}
              editMode={editMode || false}
              kafkaInstanceDetails={kafkaInstanceDetails}
              updateEditMode={updateEditMode}
              connectorData={connectorData}
              connectorTypeDetails={connectorTypeDetails}
            />
          ) : (
            <Loading />
          )}
        </Tab>
      </Tabs>
    </>
  );
};

/**
 * Extract the tab name out of the document hash
 * @param hash
 * @returns
 */
const getTab = (hash: string): string => {
  const answer = hash.includes('&')
    ? hash.substring(1, hash.indexOf('&'))
    : hash.substring(1);
  return answer !== '' ? answer : CONNECTOR_DETAILS_TABS.Overview;
};
