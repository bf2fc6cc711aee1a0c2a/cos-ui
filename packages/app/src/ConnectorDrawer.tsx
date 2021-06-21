import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Connector } from '@cos-ui/api';
import './ConnectorDrawer.css';

export type ConnectorDrawerProps = {
  isExpanded: boolean;
  selectedConnectors: Connector | null;
  onClose: () => void;
  children: React.ReactNode;
};

export const ConnectorDrawer: React.FunctionComponent<ConnectorDrawerProps> = ({
  children,
  isExpanded,
  selectedConnectors,
  onClose,
}: ConnectorDrawerProps) => {
  const { t } = useTranslation();

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
            <Text component={TextVariants.small}> Connector name</Text>

            <Title headingLevel={'h2'} size={TitleSizes['xl']}>
              {selectedConnectors?.metadata?.name}
            </Title>
          </TextContent>
          <DrawerActions>
            <DrawerCloseButton onClick={onClose} />
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
                      selectedConnectors?.kafka?.bootstrap_server
                    )}
                    {textListItem(
                      'Connector',
                      selectedConnectors?.metadata?.name
                    )}
                    {textListItem(
                      'Kafka_instance',
                      selectedConnectors?.metadata?.kafka_id
                    )}
                    {textListItem('Owner', selectedConnectors?.metadata?.owner)}
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
    <Drawer isExpanded={isExpanded}>
      <DrawerContent panelContent={panelContent()}>{children}</DrawerContent>
    </Drawer>
  );
};
