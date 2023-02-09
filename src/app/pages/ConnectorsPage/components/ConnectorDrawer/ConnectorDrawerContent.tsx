import React, {
  FunctionComponent,
  useState,
  MouseEvent,
  ReactNode,
} from 'react';

import {
  ClipboardCopy,
  DrawerPanelBody,
  Hint,
  HintBody,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';
import { KafkaInstance } from '@rhoas/app-services-ui-shared';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import { ConnectorInfoTextList } from '../../../../components/ConnectorInfoTextList/ConnectorInfoTextList';

export type ConnectorDrawerContentProps = {
  createdAt: string;
  currentState: string;
  errorStateMessage?: string;
  id: string;
  kafkaBootstrapServer: string;
  kafkaInstanceData: string | KafkaInstance | ReactNode;
  modifiedAt: string;
  name: string;
  namespaceData: ConnectorNamespace | ReactNode;
  onDuplicateConnector: (id: string) => void;
  owner: string;
};
export const ConnectorDrawerContent: FunctionComponent<ConnectorDrawerContentProps> =
  ({
    createdAt,
    currentState,
    errorStateMessage,
    id,
    kafkaBootstrapServer,
    kafkaInstanceData,
    modifiedAt,
    name,
    namespaceData,
    onDuplicateConnector,
    owner,
  }) => {
    const { t } = useTranslation();

    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const selectActiveKey = (_: MouseEvent, eventKey: string | number) => {
      setActiveTabKey(eventKey);
    };
    return (
      <DrawerPanelBody>
        {currentState === 'failed' && (
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
        <Tabs activeKey={activeTabKey} onSelect={selectActiveKey}>
          <Tab eventKey={0} title={<TabTitleText>{t('details')}</TabTitleText>}>
            <ConnectorInfoTextList
              bootstrapServer={kafkaBootstrapServer}
              createdAt={new Date(createdAt)}
              error={errorStateMessage}
              id={id!}
              kafkaInstanceData={kafkaInstanceData}
              modifiedAt={new Date(modifiedAt)}
              name={name}
              namespaceData={namespaceData}
              onDuplicateConnector={onDuplicateConnector}
              owner={owner!}
            />
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    );
  };
