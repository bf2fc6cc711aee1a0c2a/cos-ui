import { getConnector, getConnectorTypeDetail } from '@apis/api';
import { Loading } from '@app/components/Loading/Loading';
import { CONNECTOR_DETAILS_TABS } from '@constants/constants';
import { useCos } from '@context/CosContext';
import _ from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import {
  PageSection,
  Tab,
  Tabs,
  TabTitleText,
  PageSectionVariants,
  AlertVariant,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorType } from '@rhoas/connector-management-sdk';

import { ConfigurationTab } from './ConfigurationTab';
import { ConnectorDetailsHeader } from './ConnectorDetailsHeader/ConnectorDetailsHeader';
import { OverviewTab } from './OverviewTab';

export interface ParamTypes {
  id: string;
}
const getTab = (hash: string): string => {
  return hash.includes('&')
    ? hash.substring(1, hash.indexOf('&'))
    : hash.substring(1);
};

type ConnectorDetailsPageProps = {
  onSave: () => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorDetailsPage: FC<ConnectorDetailsPageProps> = ({
  onSave,
  onDuplicateConnector,
}) => {
  let { id } = useParams<ParamTypes>();
  let { hash } = useLocation();
  const history = useHistory();

  const alert = useAlert();
  const { t } = useTranslation();

  const { connectorsApiBasePath, getToken } = useCos();

  const [activeTabKey, setActiveTabKey] = useState<string | number>(
    getTab(hash)
  );
  const [editMode, setEditMode] = useState<boolean>();

  const [connectorData, setConnectorData] = useState<Connector>();
  const [connectorTypeDetails, setConnectorTypeDetails] =
    useState<ConnectorType>();

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connector-details-page',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
        description,
      });
    },
    [alert, t]
  );

  const updateEditMode = useCallback(
    (editEnable: boolean) => {
      setEditMode(editEnable);
    },
    [setEditMode]
  );

  /**
   * React callback to set connector data from fetch response
   */
  const getConnectorData = useCallback(
    (data) => {
      _.isEqual(data, connectorData) || setConnectorData(data);
    },
    [connectorData]
  );

  /**
   * React callback to set connector type details from fetch response
   */
  const getConnectorTypeInfo = useCallback((data) => {
    setConnectorTypeDetails(data as ConnectorType);
  }, []);

  const fetchConnector = useCallback(async () => {
    await getConnector({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connectorId: id,
    })(getConnectorData, onError);
  }, [getToken, connectorsApiBasePath, id, getConnectorData, onError]);

  useEffect(() => {
    fetchConnector();
    const timer = setInterval(fetchConnector, 5000);
    return () => clearInterval(timer);
  }, [fetchConnector]);

  useEffect(() => {
    if (connectorData?.connector_type_id) {
      getConnectorTypeDetail({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
        connectorTypeId: connectorData?.connector_type_id,
      })(getConnectorTypeInfo);
    }
  }, [
    connectorData?.connector_type_id,
    connectorsApiBasePath,
    getConnectorTypeInfo,
    getToken,
  ]);

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

  return (
    <>
      {connectorData ? (
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
          <PageSection
            padding={{ default: 'noPadding' }}
            style={{ zIndex: 0 }}
            variant={PageSectionVariants.light}
          >
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
              <Tab
                eventKey={CONNECTOR_DETAILS_TABS.Overview}
                title={<TabTitleText>{t('overview')}</TabTitleText>}
              >
                <OverviewTab
                  connectorData={connectorData}
                  onDuplicateConnector={onDuplicateConnector}
                />
              </Tab>
              <Tab
                eventKey={CONNECTOR_DETAILS_TABS.Configuration}
                title={<TabTitleText>{t('configuration')}</TabTitleText>}
              >
                {connectorTypeDetails ? (
                  <ConfigurationTab
                    onSave={onSave}
                    editMode={editMode || false}
                    updateEditMode={updateEditMode}
                    connectorData={connectorData}
                    connectorTypeDetails={connectorTypeDetails}
                  />
                ) : (
                  <Loading />
                )}
              </Tab>
            </Tabs>
          </PageSection>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
};
