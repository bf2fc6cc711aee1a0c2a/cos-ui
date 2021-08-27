import { useTranslation } from 'react-i18next';

export enum ConnectorStatus {
  Ready = 'ready',
  Failed = 'failed',
  Assigning = 'assigning',
  Assigned = 'assigned',
  Updating = 'updating',
  Provisioning = 'provisioning',
  Deleting = 'deleting',
  Deleted = 'deleted',
}

export function useConnectorStatusLabel(status: string) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: ConnectorStatus.Ready, label: t('Running') },
    { value: ConnectorStatus.Failed, label: t('Failed') },
    { value: ConnectorStatus.Assigning, label: t('Creation pending') },
    { value: ConnectorStatus.Assigned, label: t('Creation in progress') },
    { value: ConnectorStatus.Updating, label: t('Creation in progress') },
    { value: ConnectorStatus.Provisioning, label: t('Creation in progress') },
    { value: ConnectorStatus.Deleting, label: t('Deleting') },
    { value: ConnectorStatus.Deleted, label: t('Deleted') },
  ];

  return statusOptions.find((s) => s.value === status)?.label || status;
}
