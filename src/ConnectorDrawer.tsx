import './ConnectorDrawer.css';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
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

import { useConnectorsMachine } from './Connectors.machine';
import { useConnectorsMachineService } from './Connectors.machine-context';

export type ConnectorDrawerProps = {
  children: React.ReactNode;
};

export const ConnectorDrawer: React.FunctionComponent<ConnectorDrawerProps> = ({
  children,
}: ConnectorDrawerProps) => {
  const { t } = useTranslation();
  const service = useConnectorsMachineService();
  const { selectedConnector, deselectConnector } =
    useConnectorsMachine(service);
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const selectActiveKey = (_: React.MouseEvent, eventKey: string | number) => {
    setActiveTabKey(eventKey);
  };

  const textListItem = (title: string, value?: string) => (
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

  const panelContent = () => {
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

            <Title
              headingLevel={'h2'}
              size={TitleSizes['xl']}
              className="connector-drawer__header-title"
            >
              {selectedConnector?.metadata?.name}
            </Title>
          </TextContent>
          <DrawerActions>
            <DrawerCloseButton onClick={deselectConnector} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <Tabs activeKey={activeTabKey} onSelect={selectActiveKey}>
            <Tab
              eventKey={0}
              title={<TabTitleText>{t('overview')}</TabTitleText>}
            >
              <div className="connector-drawer__tab-content">
                <TextContent>
                  <TextList component={TextListVariants.dl}>
                    {textListItem(
                      'Bootstrap server',
                      selectedConnector?.kafka?.bootstrap_server
                    )}
                    {textListItem(
                      'Connector',
                      selectedConnector?.metadata?.name
                    )}
                    {textListItem(
                      'Kafka_instance',
                      selectedConnector?.metadata?.kafka_id
                    )}
                    {textListItem('Owner', selectedConnector?.metadata?.owner)}
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

  return (
    <Drawer isExpanded={selectedConnector !== undefined}>
      <DrawerContent panelContent={panelContent()}>{children}</DrawerContent>
    </Drawer>
  );
};
