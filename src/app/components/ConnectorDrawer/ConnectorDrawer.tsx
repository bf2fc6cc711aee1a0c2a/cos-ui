import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import { DialogDeleteConnector } from '@app/components/DialogDeleteConnector/DialogDeleteConnector';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import React, {
  FunctionComponent,
  ReactNode,
  useState,
  MouseEvent,
  SyntheticEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Tab,
  Tabs,
  TabTitleText,
  Text,
  TextContent,
  TextVariants,
  Title,
  TitleSizes,
  DropdownItem,
  Dropdown,
  KebabToggle,
  DropdownPosition,
  DropdownSeparator,
} from '@patternfly/react-core';

import { Connector } from '@rhoas/connector-management-sdk';

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
    error,
    onClose,
    onConnectorDetail,
    onDuplicateConnector,
  }) => {
    const [showDeleteConnectorConfirm, setShowDeleteConnectorConfirm] =
      useState(false);
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
      setActiveTabKey(eventKey);
    };

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const {
      connector,
      canStart,
      canStop,
      canDelete,
      onStart,
      onStop,
      onDelete,
    } = useConnector(currentConnectorRef as ConnectorMachineActorRef);
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
    const doCancelDeleteConnector = () => {
      setShowDeleteConnectorConfirm(false);
    };
    const doDeleteConnector = () => {
      setShowDeleteConnectorConfirm(false);
      onDelete();
    };

    const dropdownItems = [
      <DropdownItem
        key="start action"
        component="button"
        onClick={onStart}
        isDisabled={!canStart}
      >
        {t('Start')}
      </DropdownItem>,
      <DropdownItem
        key="stop action"
        component="button"
        onClick={onStop}
        isDisabled={!canStop}
      >
        {t('Stop')}
      </DropdownItem>,
      <DropdownItem
        key="edit action"
        component="button"
        onClick={() => onConnectorDetail(id, 'configuration')}
      >
        {t('Edit')}
      </DropdownItem>,
      <DropdownItem
        key="Duplicate action"
        component="button"
        onClick={() => onDuplicateConnector(id)}
      >
        {t('Duplicate')}
      </DropdownItem>,
      <DropdownSeparator key="separator" />,
      <DropdownItem
        key="delete action"
        component="button"
        onClick={() => setShowDeleteConnectorConfirm(true)}
        isDisabled={!canDelete}
      >
        {t('Delete')}
      </DropdownItem>,
    ];
    return (
      <>
        <DialogDeleteConnector
          connectorName={name}
          showDialog={showDeleteConnectorConfirm}
          onCancel={doCancelDeleteConnector}
          onConfirm={doDeleteConnector}
        />
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
                    name={name}
                    status={connector.status?.state!}
                  />
                </FlexItem>
              </Flex>
            </TextContent>
            <DrawerActions>
              <Dropdown
                onSelect={onSelect}
                toggle={
                  <KebabToggle onToggle={onToggle} id="connector-action" />
                }
                isOpen={isOpen}
                isPlain
                dropdownItems={dropdownItems}
                position={DropdownPosition.right}
              />
              <DrawerCloseButton onClick={onClose} />
            </DrawerActions>
          </DrawerHead>
          <DrawerPanelBody>
            <Tabs activeKey={activeTabKey} onSelect={selectActiveKey}>
              <Tab
                eventKey={0}
                title={<TabTitleText>{t('details')}</TabTitleText>}
              >
                <div className="connector-drawer__tab-content">
                  <ConnectorInfoTextList
                    name={name}
                    id={id}
                    bootstrapServer={bootstrapServer}
                    kafkaId={kafkaId}
                    namespaceId={namespaceId}
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
      </>
    );
  };
