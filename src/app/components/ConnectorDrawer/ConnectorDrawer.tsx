import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import React, {
  FunctionComponent,
  ReactNode,
  useState,
  MouseEvent,
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
} from '@patternfly/react-core';

import { Connector } from '@rhoas/connector-management-sdk';

import { ConnectorInfoTextList } from '../ConnectorInfoTextList/ConnectorInfoTextList';
import './ConnectorDrawer.css';

export type ConnectorDrawerProps = {
  children: ReactNode;
  connector?: Connector;
  onClose: () => void;
};

export const ConnectorDrawer: FunctionComponent<ConnectorDrawerProps> = ({
  children,
  connector,
  onClose,
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
};

export const ConnectorDrawerPanelContent: FunctionComponent<ConnectorDrawerPanelContentProps> =
  ({
    name,
    id,
    bootstrapServer,
    kafkaId,
    owner,
    namespaceId,
    createdAt,
    modifiedAt,
    status,
    error,
    onClose,
  }) => {
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
      setActiveTabKey(eventKey);
    };

    return (
      <DrawerPanelContent widths={{ default: 'width_50' }}>
        <DrawerHead>
          <TextContent>
            <Text
              component={TextVariants.small}
              className="connector-drawer__header-text"
            >
              Connector name
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
                <ConnectorStatus name={name} status={status} />
              </FlexItem>
            </Flex>
          </TextContent>
          <DrawerActions>
            <DrawerCloseButton onClick={onClose} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <Tabs activeKey={activeTabKey} onSelect={selectActiveKey}>
            <Tab
              eventKey={0}
              title={<TabTitleText>{t('Details')}</TabTitleText>}
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
                  modifiedAt={modifiedAt}
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
