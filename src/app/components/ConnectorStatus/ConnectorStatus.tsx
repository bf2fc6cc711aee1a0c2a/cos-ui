import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PendingIcon,
} from '@patternfly/react-icons';

import './ConnectorStatus.css';

type ConnectorStatusProps = {
  name: string;
  status: string;
};

export const ConnectorStatus: FunctionComponent<ConnectorStatusProps> = ({
  name,
  status,
}) => {
  const label = useConnectorStatusLabel(status);

  return (
    <Flex>
      <FlexItem spacer={{ default: 'spacerSm' }}>
        <ConnectorStatusIcon name={name} status={status} />
      </FlexItem>
      <FlexItem>{label}</FlexItem>
    </Flex>
  );
};

export const ConnectorStatusIcon: FunctionComponent<ConnectorStatusProps> = ({
  name,
  status,
}) => {
  switch (status?.toLowerCase()) {
    case 'ready':
      return (
        <CheckCircleIcon className="cos--connectors__table--icon--completed" />
      );
    case 'failed':
      return (
        <ExclamationCircleIcon className="cos--connectors__table--icon--failed" />
      );
    case 'accepted':
      return <PendingIcon />;
    case 'provisioning':
    case 'preparing':
    case 'disconnected':
      return (
        <Spinner
          size="md"
          aria-label={name}
          aria-valuetext="Creation in progress"
        />
      );
    case 'deprovision':
    case 'deleted':
      return null;
  }
  return <PendingIcon />;
};

export enum ConnectorStatuses {
  Ready = 'ready',
  Failed = 'failed',
  Assigning = 'assigning',
  Assigned = 'assigned',
  Updating = 'updating',
  Provisioning = 'provisioning',
  Deleting = 'deleting',
  Deleted = 'deleted',
  Disconnected = 'disconnected',
}

export function useConnectorStatusLabel(status: string) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: ConnectorStatuses.Ready, label: t('Running') },
    { value: ConnectorStatuses.Failed, label: t('Failed') },
    { value: ConnectorStatuses.Assigning, label: t('Creation pending') },
    { value: ConnectorStatuses.Assigned, label: t('Creation in progress') },
    { value: ConnectorStatuses.Updating, label: t('Creation in progress') },
    { value: ConnectorStatuses.Provisioning, label: t('Creation in progress') },
    { value: ConnectorStatuses.Deleting, label: t('Deleting') },
    { value: ConnectorStatuses.Deleted, label: t('Deleted') },
    { value: ConnectorStatuses.Disconnected, label: t('Provisioning') },
  ];

  return statusOptions.find((s) => s.value === status)?.label || status;
}
