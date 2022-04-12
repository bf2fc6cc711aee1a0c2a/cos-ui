import { capitalize } from 'lodash';
import React, { FunctionComponent } from 'react';

import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  OutlinedPauseCircleIcon,
  OutlinedTimesCircleIcon,
} from '@patternfly/react-icons';
import * as tokens from '@patternfly/react-tokens';

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
      return <CheckCircleIcon color={tokens.global_success_color_100.value} />;
    case 'failed':
      return (
        <ExclamationCircleIcon color={tokens.global_danger_color_100.value} />
      );
    case 'stopped':
      return <OutlinedPauseCircleIcon />;
    case 'deleted':
      return <OutlinedTimesCircleIcon />;
    default:
      return (
        <Spinner
          size="md"
          aria-label={name}
          aria-valuetext="Please wait, tasks are in progress"
        />
      );
  }
};

export function useConnectorStatusLabel(status: string) {
  return typeof status !== undefined ? capitalize(status) : 'Undefined';
}
