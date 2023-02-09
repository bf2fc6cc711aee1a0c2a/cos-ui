import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import React, { FunctionComponent, ReactNode } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerPanelContent,
} from '@patternfly/react-core';

import { Connector } from '@rhoas/connector-management-sdk';

import './ConnectorDrawer.css';
import { ConnectorDrawerData } from './ConnectorDrawerData';
import { DrawerHeader } from './DrawerHeader';

export type ConnectorDrawerProps = {
  connector: Connector | undefined;
  children: ReactNode;
  actionsMenu: ReactNode;
  onClose: () => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorDrawer: FunctionComponent<ConnectorDrawerProps> = ({
  connector,
  actionsMenu,
  children,
  onClose,
  onDuplicateConnector,
}) => {
  return (
    <Drawer isExpanded={typeof connector !== 'undefined'}>
      <DrawerContent
        panelContent={
          typeof connector !== 'undefined' && (
            <DrawerPanelContent widths={{ default: 'width_50' }}>
              <DrawerHeader
                drawerHeading={connector.name}
                status={
                  <ConnectorStatus
                    desiredState={connector.desired_state}
                    name={connector.name}
                    state={connector.status?.state!}
                  />
                }
                actionsMenu={actionsMenu}
                onClose={onClose}
              />
              <ConnectorDrawerData
                createdAt={connector.created_at!}
                currentState={connector.status?.state!}
                errorStateMessage={connector.status?.error}
                id={connector.id!}
                kafkaBootstrapServer={connector.kafka.url}
                kafkaInstanceId={connector.kafka.id}
                modifiedAt={connector.modified_at!}
                name={connector.name}
                namespaceId={connector.namespace_id}
                onClose={onClose}
                onDuplicateConnector={onDuplicateConnector}
                owner={connector.owner!}
              />
            </DrawerPanelContent>
          )
        }
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
};
