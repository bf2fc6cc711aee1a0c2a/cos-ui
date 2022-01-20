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
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import { AddonClusterTarget, Connector } from '@rhoas/connector-management-sdk';

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
              name={connector.metadata!.name!}
              bootstrapServer={connector.kafka!.bootstrap_server!}
              kafkaId={connector.metadata!.kafka_id!}
              owner={connector.metadata!.owner!}
              cluster={
                (connector.deployment_location as AddonClusterTarget)
                  .cluster_id!
              }
              createdAt={new Date(connector.metadata!.created_at!)}
              updatedAt={new Date(connector.metadata!.updated_at!)}
              status={connector.status!}
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
  bootstrapServer: string;
  kafkaId: string;
  owner: string;
  cluster: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  onClose: () => void;
};

export const ConnectorDrawerPanelContent: FunctionComponent<ConnectorDrawerPanelContentProps> =
  ({
    name,
    bootstrapServer,
    kafkaId,
    owner,
    cluster,
    createdAt,
    updatedAt,
    status,
    onClose,
  }) => {
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
      setActiveTabKey(eventKey);
    };

    const textListItem = (title: string, value?: ReactNode) => (
      <>
        {value && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              {title}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {value}
            </TextListItem>
          </>
        )}
      </>
    );

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
                <TextContent>
                  <TextList component={TextListVariants.dl}>
                    {textListItem('Bootstrap server', bootstrapServer)}
                    {textListItem('Connector', name)}
                    {textListItem('Kafka_instance', kafkaId)}
                    {textListItem('Targeted OSD Cluster', cluster)}
                    {textListItem('Owner', owner)}
                    {textListItem(
                      'Time created',
                      <time
                        title={t('{{date}}', { date: createdAt })}
                        dateTime={createdAt.toISOString()}
                      >
                        {t('{{ date, ago }}', { date: createdAt })}
                      </time>
                    )}
                    {textListItem(
                      'Time updated',
                      <time
                        title={t('{{date}}', { date: updatedAt })}
                        dateTime={updatedAt.toISOString()}
                      >
                        {t('{{ date, ago }}', { date: updatedAt })}
                      </time>
                    )}
                  </TextList>
                </TextContent>
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
