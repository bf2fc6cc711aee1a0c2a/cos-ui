import { getKafkaInstanceById, getNamespace } from '@apis/api';
import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import { useCos } from '@context/CosContext';
import { getPendingTime, warningType } from '@utils/shared';
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
  Alert,
  AlertVariant,
  ClipboardCopy,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Hint,
  HintBody,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
  Text,
  TextContent,
  TextVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { ClockIcon } from '@patternfly/react-icons';

import { KafkaInstance, useAlert } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorNamespace } from '@rhoas/connector-management-sdk';

import { ConnectorActionsMenu } from '../ConnectorActions/ConnectorActionsMenu';
import { ConnectorInfoTextList } from '../ConnectorInfoTextList/ConnectorInfoTextList';
import './ConnectorDrawer.css';

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
            <ConnectorDrawerPanelContent
              name={connector.name}
              id={connector.id!}
              bootstrapServer={connector.kafka!.url!}
              kafkaId={connector.kafka.id}
              owner={connector.owner!}
              namespaceId={connector.namespace_id!}
              createdAt={new Date(connector.created_at!)}
              modifiedAt={new Date(connector.modified_at!)}
              status={connector.status?.state!}
              error={connector.status?.error}
              onClose={onClose}
              onConnectorDetail={onConnectorDetail}
              onDuplicateConnector={onDuplicateConnector}
              currentConnectorRef={currentConnectorRef}
            />
          ) : undefined
        }
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export type ConnectorDrawerPanelContentProps = {
  currentConnectorRef: ConnectorMachineActorRef;
  name: string;
  id: string;
  bootstrapServer: string;
  kafkaId: string;
  owner: string;
  namespaceId: string;
  createdAt: Date;
  modifiedAt: Date;
  status: string;
  error?: string;
  onClose: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorDrawerPanelContent: FunctionComponent<ConnectorDrawerPanelContentProps> =
  ({
    currentConnectorRef,
    name,
    id,
    bootstrapServer,
    kafkaId,
    owner,
    namespaceId,
    createdAt,
    status,
    error,
    onClose,
    onConnectorDetail,
    onDuplicateConnector,
  }) => {
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const [namespaceData, setNamespaceData] =
      useState<ConnectorNamespace | null>();
    const [KIData, setKIData] = useState<KafkaInstance | string>();

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
        namespaceId: namespaceId,
      })(getNamespaceData, onError);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [namespaceId]);

    useEffect(() => {
      setKIData('');
      getKafkaInstanceById({
        accessToken: getToken,
        kafkaManagementBasePath: kafkaManagementApiBasePath,
        KafkaInstanceId: kafkaId,
      })(getKIData, onKIError);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kafkaId]);

    const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
      setActiveTabKey(eventKey);
    };

    const { connector } = useConnector(
      currentConnectorRef as ConnectorMachineActorRef
    );

    React.useEffect(() => {
      if (connector.status?.state == 'deleted') {
        onClose();
      }
    }, [connector, onClose]);

    const getConnectorExpireAlert = (expiration: string): string => {
      const { hours, min } = getPendingTime(new Date(expiration));
      if (hours < 0 || min < 0) {
        return t('connectorExpiredMsg');
      }
      return t('connectorExpire', { hours, min });
    };

    const getConnectorExpireInlineAlert = (expiration: string): string => {
      const { hours, min } = getPendingTime(new Date(expiration));
      if (hours < 0 || min < 0) {
        return t('connectorExpiredInline');
      }
      return t('connectorExpireInline', { hours, min });
    };

    return (
      <DrawerPanelContent widths={{ default: 'width_50' }}>
        <DrawerHead>
          <TextContent>
            <Text
              component={TextVariants.small}
              className="connector-drawer__header-text"
            >
              {t('connectorName')}
            </Text>
            <Flex>
              <FlexItem>
                <Title
                  headingLevel={'h2'}
                  size={TitleSizes['xl']}
                  className="connector-drawer__header-title"
                >
                  {name}
                </Title>
              </FlexItem>
              <FlexItem spacer={{ default: 'spacerSm' }}>
                <ConnectorStatus
                  desiredState={connector.desired_state!}
                  name={name}
                  state={connector.status?.state!}
                />
              </FlexItem>
            </Flex>
          </TextContent>

          <DrawerActions>
            <ConnectorActionsMenu
              onDuplicateConnector={onDuplicateConnector}
              onConnectorDetail={onConnectorDetail}
              onClose={onClose}
            />
            <DrawerCloseButton onClick={onClose} />
          </DrawerActions>
        </DrawerHead>
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
              {namespaceData?.expiration && (
                <Alert
                  customIcon={<ClockIcon />}
                  className="pf-u-mt-md"
                  variant={warningType(new Date(namespaceData?.expiration!))}
                  isInline
                  title={getConnectorExpireAlert(namespaceData?.expiration!)}
                />
              )}

              <div className="connector-drawer__tab-content">
                <ConnectorInfoTextList
                  name={name}
                  id={id}
                  bootstrapServer={bootstrapServer}
                  kafkaId={KIData ? KIData! : <Spinner size="md" />}
                  namespaceId={
                    namespaceData ? namespaceData.name : <Spinner size="md" />
                  }
                  namespaceMsg={
                    namespaceData?.expiration &&
                    getConnectorExpireInlineAlert(namespaceData?.expiration!)
                  }
                  namespaceMsgVariant={
                    namespaceData?.expiration
                      ? warningType(new Date(namespaceData?.expiration!))
                      : undefined
                  }
                  owner={owner}
                  createdAt={createdAt}
                  modifiedAt={new Date(connector.modified_at!)}
                  error={error}
                />
              </div>
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
