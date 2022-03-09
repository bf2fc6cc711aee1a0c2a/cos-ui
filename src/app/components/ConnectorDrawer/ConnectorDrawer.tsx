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

import { Connector } from '@rhoas/connector-management-sdk';

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
              cluster={connector.deployment_location.cluster_id!}
              createdAt={new Date(connector.created_at!)}
              modifiedAt={new Date(connector.modified_at!)}
              status={connector.status?.state!}
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
  cluster: string;
  createdAt: Date;
  modifiedAt: Date;
  status: string;
  onClose: () => void;
};

export const ConnectorDrawerPanelContent: FunctionComponent<ConnectorDrawerPanelContentProps> =
  ({
    name,
    id,
    bootstrapServer,
    kafkaId,
    owner,
    cluster,
    createdAt,
    modifiedAt,
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
                    {textListItem('Connector', name)}
                    {textListItem('Connector Id', id)}
                    {textListItem('Bootstrap server', bootstrapServer)}
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
                        title={t('{{date}}', { date: modifiedAt })}
                        dateTime={modifiedAt.toISOString()}
                      >
                        {t('{{ date, ago }}', { date: modifiedAt })}
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
