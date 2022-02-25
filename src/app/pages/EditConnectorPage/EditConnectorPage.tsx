import { getConnector, getConnectorTypeDetail } from '@apis/api';
import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import { Loading } from '@app/components/Loading/Loading';
import { useCos } from '@context/CosContext';
import React, {
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  PageSection,
  Breadcrumb,
  BreadcrumbItem,
  Level,
  Tab,
  Tabs,
  TabTitleText,
  LevelItem,
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
  Title,
  Button,
  Modal,
  PageSectionVariants,
  StackItem,
} from '@patternfly/react-core';

import { useBasename } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorType } from '@rhoas/connector-management-sdk';

import { ConfigurationPage } from './ConfigurationPage';
import './EditConnectorPage.css';
import { OverviewPage } from './OverviewPage';

export interface ParamTypes {
  id: string;
}
export interface EditConnectorPageProps {
  onSave: () => void;
  onClose: () => void;
}
export const EditConnectorPage: FC<EditConnectorPageProps> = ({
  onSave,
  onClose,
}) => {
  let { id } = useParams<ParamTypes>();

  const { t } = useTranslation();

  const { connectorsApiBasePath, getToken } = useCos();

  const [activeTabKey, setActiveTabKey] = useState<string | number>(1);

  const [connectorData, setConnectorData] = useState<Connector>();
  const [connectorTypeDetails, setConnectorTypeDetails] =
    useState<ConnectorType>();

  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);

  const getConnectorData = useCallback((data) => {
    setConnectorData(data as Connector);
  }, []);

  const getConnectorTypeInfo = useCallback((data) => {
    setConnectorTypeDetails(data as ConnectorType);
  }, []);

  useEffect(() => {
    getConnector({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connectorId: id,
    })(getConnectorData);

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (connectorData?.connector_type_id) {
      getConnectorTypeDetail({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
        connectorTypeId: connectorData?.connector_type_id,
      })(getConnectorTypeInfo);
    }

    return () => {
      // second
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorData]);

  // Toggle currently active tab
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <>
      {!connectorData && <Loading />}
      {connectorData && (
        <>
          <EditConnectorHeader connectorData={connectorData} />
          <StackItem>
            <PageSection
              padding={{ default: 'noPadding' }}
              style={{ zIndex: 0 }}
              variant={PageSectionVariants.light}
            >
              <div>
                <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                  <Tab
                    eventKey={0}
                    title={<TabTitleText>{t('Overview')}</TabTitleText>}
                  >
                    <OverviewPage connectorData={connectorData} />
                  </Tab>
                  <Tab
                    eventKey={1}
                    title={<TabTitleText>{t('Configuration')}</TabTitleText>}
                  >
                    {connectorTypeDetails ? (
                      <ConfigurationPage
                        connectorData={connectorData}
                        connectorTypeDetails={connectorTypeDetails}
                      />
                    ) : (
                      <Loading />
                    )}
                  </Tab>
                </Tabs>
              </div>

              {/* <footer className="edit-connector-page_footer pf-u-p-md">
              <Button
                variant="primary"
                className="pf-u-mr-md pf-u-mb-sm"
                onClick={onSave}
              >
                Save
              </Button>
              <Button variant="secondary" onClick={openLeaveConfirm}>
                Cancel
              </Button>
            </footer> */}
            </PageSection>
          </StackItem>
          <StackItem isFilled className="pf-u-background-color-100" />

          <StackItem>
            <PageSection
              variant={PageSectionVariants.light}
              className="pf-u-p-md"
            >
              <Button
                variant="primary"
                className="pf-u-mr-md pf-u-mb-sm"
                onClick={onSave}
              >
                Save
              </Button>
              <Button variant="secondary" onClick={openLeaveConfirm}>
                Cancel
              </Button>
            </PageSection>
          </StackItem>
        </>
      )}
      <Modal
        title={t('Leave page?')}
        variant={'small'}
        isOpen={askForLeaveConfirm}
        onClose={closeLeaveConfirm}
        actions={[
          <Button key="confirm" variant="primary" onClick={onClose}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
            Cancel
          </Button>,
        ]}
      >
        {t('Changes you have made will be lost.')}
      </Modal>
    </>
  );
};

export type EditConnectorHeaderProps = {
  connectorData: Connector;
};

export const EditConnectorHeader: FC<EditConnectorHeaderProps> = ({
  connectorData,
}) => {
  const { t } = useTranslation();
  const basename = useBasename();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };
  const onSelect = (
    _event?: SyntheticEvent<HTMLDivElement, Event> | undefined
  ) => {
    setIsOpen(!isOpen);
    onFocus();
  };
  const onFocus = () => {
    const element = document.getElementById('connector-action');
    element?.focus();
  };

  const dropdownItems = [
    <DropdownItem key="start action" component="button" onClick={() => {}}>
      Start
    </DropdownItem>,
    <DropdownItem key="stop action" component="button" onClick={() => {}}>
      Stop
    </DropdownItem>,
    <DropdownItem
      key="delete action"
      component="button"
      isDisabled
      onClick={() => {}}
    >
      Delete
    </DropdownItem>,
  ];

  return (
    <PageSection variant={'light'} hasShadowBottom>
      <Breadcrumb>
        <BreadcrumbItem to={basename?.getBasename()}>
          {t('Connectors')}
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{connectorData?.name}</BreadcrumbItem>
      </Breadcrumb>
      <Level className={'pf-u-pt-md pf-u-pb-md'}>
        <LevelItem>
          <Level>
            <Title headingLevel="h1" className={'pf-u-pr-md'}>
              {connectorData?.name}
            </Title>
            <ConnectorStatus
              name={connectorData?.name!}
              status={connectorData?.status?.state!}
            />
          </Level>
        </LevelItem>
        <LevelItem>
          <Dropdown
            onSelect={onSelect}
            toggle={<KebabToggle onToggle={onToggle} id="connector-action" />}
            isOpen={isOpen}
            isPlain
            dropdownItems={dropdownItems}
            position={DropdownPosition.right}
          />
        </LevelItem>
      </Level>
    </PageSection>
  );
};
