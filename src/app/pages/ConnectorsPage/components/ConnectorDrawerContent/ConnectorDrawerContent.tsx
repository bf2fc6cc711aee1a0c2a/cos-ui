import { ConnectorInfoTextList } from '@app/components/ConnectorInfoTextList/ConnectorInfoTextList';
import { SomethingWentWrongInline } from '@app/components/SomethingWentWrongInline/SomethingWentWrongInline';
import React, {
  FunctionComponent,
  useState,
  MouseEvent,
  ReactNode,
  ReactElement,
} from 'react';

import {
  DrawerPanelBody,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import './ConnectorDrawerContent.css';

export type ConnectorDrawerContentProps = {
  currentState: string;
  errorStateMessage?: string;
  errorHandlerContent?: ReactElement;
  id: string;
  kafkaBootstrapServer: string;
  kafkaInstanceData: string | KafkaRequest | ReactNode;
  modifiedAt: string;
  name: string;
  namespaceData: ConnectorNamespace | ReactNode;
  onDuplicateConnector: (id: string) => void;
};
export const ConnectorDrawerContent: FunctionComponent<
  ConnectorDrawerContentProps
> = ({
  currentState,
  errorStateMessage,
  errorHandlerContent,
  id,
  kafkaBootstrapServer,
  kafkaInstanceData,
  name,
  namespaceData,
  onDuplicateConnector,
}) => {
  const { t } = useTranslation();

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
    setActiveTabKey(eventKey);
  };
  return (
    <DrawerPanelBody>
      {currentState === 'failed' && (
        <SomethingWentWrongInline errorMessage={errorStateMessage!} />
      )}
      <Tabs activeKey={activeTabKey} onSelect={selectActiveKey}>
        <Tab eventKey={0} title={<TabTitleText>{t('details')}</TabTitleText>}>
          {errorHandlerContent}
          <ConnectorInfoTextList
            bootstrapServer={kafkaBootstrapServer}
            id={id!}
            kafkaInstanceData={kafkaInstanceData}
            name={name}
            namespaceData={namespaceData}
            onDuplicateConnector={onDuplicateConnector}
          />
        </Tab>
      </Tabs>
    </DrawerPanelBody>
  );
};
