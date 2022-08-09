import { getKafkaInstanceById, getNamespace } from '@apis/api';
import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import { useCos } from '@context/CosContext';
import React, {
  FunctionComponent,
  ReactNode,
  useState,
  MouseEvent,
  useCallback,
  useEffect,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  AlertVariant,
  ClipboardCopy,
  Drawer,
  DrawerContent,
  DrawerPanelBody,
  DrawerPanelContent,
  Hint,
  HintBody,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import { KafkaInstance, useAlert } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorNamespace } from '@rhoas/connector-management-sdk';

import { ConnectorActionsMenu } from '../ConnectorActions/ConnectorActionsMenu';
import { ConnectorInfoTextList } from '../ConnectorInfoTextList/ConnectorInfoTextList';
import './ConnectorDrawer.css';
import { DrawerHeader } from './DrawerHeader';

export type ConnectorDrawerProps = {
  currentConnectorRef: ConnectorMachineActorRef;
  children: ReactNode;
  connector?: Connector;
  onClose: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorDrawer: FunctionComponent<ConnectorDrawerProps> = ({
  currentConnectorRef,
  children,
  connector,
  onClose,
  onConnectorDetail,
  onDuplicateConnector,
}) => {
  return (
    <Drawer isExpanded={connector !== undefined}>
      <DrawerContent
        panelContent={
          connector ? (
            <ConnectorDrawerComponent
              currentConnectorRef={currentConnectorRef}
              connectorData={connector}
              onClose={onClose}
              onConnectorDetail={onConnectorDetail}
              onDuplicateConnector={onDuplicateConnector}
            />
          ) : undefined
        }
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
};

type ConnectorDrawerComponent = {
  currentConnectorRef: ConnectorMachineActorRef;
  connectorData: Connector;
  onClose: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};
export const ConnectorDrawerComponent: FunctionComponent<ConnectorDrawerComponent> =
  ({
    currentConnectorRef,
    connectorData,
    onClose,
    onConnectorDetail,
    onDuplicateConnector,
  }) => {
    const { t } = useTranslation();
    const [namespaceData, setNamespaceData] =
      useState<ConnectorNamespace | null>(null);
    const [KIData, setKIData] = useState<KafkaInstance | string>('');

    const { connectorsApiBasePath, kafkaManagementApiBasePath, getToken } =
      useCos();

    const alert = useAlert();

    const getNamespaceData = useCallback((data) => {
      setNamespaceData(data as ConnectorNamespace);
    }, []);

    const getKIData = useCallback((data) => {
      setKIData(data as KafkaInstance);
    }, []);

    const onError = useCallback(
      (description: string) => {
        alert?.addAlert({
          id: 'connector-drawer',
          variant: AlertVariant.danger,
          title: t('somethingWentWrong'),
          description,
        });
      },
      [alert, t]
    );

    const onKIError = useCallback(
      (response: any) => {
        if (response.status === 404) {
          setKIData(t('KafkaInstanceExpired'));
        } else {
          alert?.addAlert({
            id: 'connector-drawer',
            variant: AlertVariant.danger,
            title: t('somethingWentWrong'),
            description: response?.data?.reason,
          });
        }
      },
      [alert, t]
    );

    useEffect(() => {
      setNamespaceData(null);
      getNamespace({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
        namespaceId: connectorData.namespace_id,
      })(getNamespaceData, onError);

      setKIData('');
      getKafkaInstanceById({
        accessToken: getToken,
        kafkaManagementBasePath: kafkaManagementApiBasePath,
        KafkaInstanceId: connectorData.kafka.id,
      })(getKIData, onKIError);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectorData]);

    const { connector } = useConnector(
      currentConnectorRef as ConnectorMachineActorRef
    );

    React.useEffect(() => {
      if (connector.status?.state == 'deleted') {
        onClose();
      }
    }, [connector, onClose]);

    return (
      <ConnectorDrawerContent
        name={connectorData.name}
        id={connectorData.id!}
        bootstrapServer={connectorData.kafka!.url!}
        KIData={KIData}
        owner={connectorData.owner!}
        namespaceData={namespaceData}
        createdAt={new Date(connectorData.created_at!)}
        modifiedAt={new Date(connectorData.modified_at!)}
        status={connectorData.status?.state!}
        error={connectorData.status?.error}
        onClose={onClose}
        onConnectorDetail={onConnectorDetail}
        onDuplicateConnector={onDuplicateConnector}
        connectorStatus={
          <ConnectorStatus
            desiredState={connector.desired_state!}
            name={connectorData.name}
            state={connector.status?.state!}
          />
        }
        connectorActions={
          <ConnectorActionsMenu
            onDuplicateConnector={onDuplicateConnector}
            onConnectorDetail={onConnectorDetail}
            onClose={onClose}
          />
        }
      />
    );
  };

export type ConnectorDrawerContentProps = {
  name: string;
  id: string;
  bootstrapServer: string;
  KIData: KafkaInstance | string;
  owner: string;
  namespaceData: ConnectorNamespace | null;
  createdAt: Date;
  modifiedAt: Date;
  status: string;
  error?: string;
  connectorStatus: React.ReactNode;
  connectorActions: React.ReactNode;
  onClose: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorDrawerContent: FunctionComponent<ConnectorDrawerContentProps> =
  ({
    name,
    id,
    bootstrapServer,
    KIData,
    owner,
    namespaceData,
    createdAt,
    modifiedAt,
    status,
    error,
    connectorStatus,
    connectorActions,
    onClose,
    onDuplicateConnector,
  }) => {
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
      setActiveTabKey(eventKey);
    };

    return (
      <DrawerPanelContent widths={{ default: 'width_50' }}>
        <DrawerHeader
          drawerHeading={name}
          status={connectorStatus}
          actionsMenu={connectorActions}
          onClose={onClose}
        />
        {status === 'failed' && (
          <Hint className="pf-u-mr-lg pf-u-ml-lg pf-u-p-md">
            <HintBody>
              <p>{t('previewModeMsg')}</p>
              <Trans i18nKey={'supportEmailMsg'}>
                You can still get help by emailing us at
                <ClipboardCopy
                  hoverTip="Copy"
                  clickTip="Copied"
                  variant="inline-compact"
                >
                  rhosak-eval-support@redhat.com
                </ClipboardCopy>
                . This mailing list is monitored by the Red Hat OpenShift
                Application Services team.
              </Trans>
            </HintBody>
          </Hint>
        )}
        <DrawerPanelBody>
          <Tabs activeKey={activeTabKey} onSelect={selectActiveKey}>
            <Tab
              eventKey={0}
              title={<TabTitleText>{t('details')}</TabTitleText>}
            >
              <ConnectorInfoTextList
                onDuplicateConnector={onDuplicateConnector}
                name={name}
                id={id}
                bootstrapServer={bootstrapServer}
                KIData={KIData ? KIData! : <Spinner size="md" />}
                namespaceData={
                  namespaceData ? namespaceData : <Spinner size="md" />
                }
                owner={owner}
                createdAt={createdAt}
                modifiedAt={modifiedAt}
                error={error}
              />
            </Tab>
            {/* <Tab
              eventKey={1}
              title={<TabTitleText>{t('configurations')}</TabTitleText>}
            >
              Configuration
            </Tab> */}
          </Tabs>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );
  };
