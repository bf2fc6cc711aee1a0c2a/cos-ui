import React, { FunctionComponent } from 'react';

import { Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PendingIcon,
} from '@patternfly/react-icons';

import './ConnectorStatusIcon.css';

type ConnectorStatusIconProps = {
  name: string;
  status: string;
};
export const ConnectorStatusIcon: FunctionComponent<ConnectorStatusIconProps> =
  ({ name, status }) => {
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
