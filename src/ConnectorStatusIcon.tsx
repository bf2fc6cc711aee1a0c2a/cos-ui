import './ConnectorStatusIcon.css';

import React, { FunctionComponent } from 'react';

import { Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PendingIcon,
} from '@patternfly/react-icons';

type ConnectorStatusIconProps = {
  id: string;
  status: string;
};
export const ConnectorStatusIcon: FunctionComponent<ConnectorStatusIconProps> =
  ({ id, status }) => {
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
        return (
          <Spinner
            size="md"
            aria-label={id}
            aria-valuetext="Creation in progress"
          />
        );
      case 'deprovision':
      case 'deleted':
        return null;
    }
    return <PendingIcon />;
  };
