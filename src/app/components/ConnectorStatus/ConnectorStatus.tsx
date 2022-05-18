import { capitalize } from 'lodash';
import React, { FC } from 'react';

import {
  Split,
  SplitItem,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  OutlinedPauseCircleIcon,
  OutlinedTimesCircleIcon,
} from '@patternfly/react-icons';
import * as tokens from '@patternfly/react-tokens';

import './ConnectorStatus.css';

type ConnectorStatusProps = {
  desiredState: string;
  name: string;
  state: string;
};

export const ConnectorStatus: FC<ConnectorStatusProps> = ({
  desiredState,
  name,
  state,
}) => (
  <Split className={'connector-status__split'} hasGutter>
    <SplitItem>
      <ConnectorStatusIcon name={name} state={state} />
    </SplitItem>
    <SplitItem isFilled>
      <ConnectorStatusLabel desiredState={desiredState} state={state} />
    </SplitItem>
  </Split>
);

type ConnectorStatusLabelProps = {
  desiredState: string;
  state: string;
};

export const ConnectorStatusLabel: FC<ConnectorStatusLabelProps> = ({
  desiredState,
  state,
}) => {
  switch (state?.toLowerCase()) {
    case 'ready':
    case 'failed':
    case 'stopped':
    case 'deleted':
    case '':
      return <>{convertToLabel(state)}</>;
    default:
      return (
        <Stack className={'connector-status-label__stack'}>
          <StackItem className={'connector-status-label__state-label'}>
            {convertToLabel(state)}
          </StackItem>
          <StackItem className={'connector-status-label__desired-state-label'}>
            Transitioning to <b>{convertToLabel(desiredState)}</b>
          </StackItem>
        </Stack>
      );
  }
};

type ConnectorStatusIconProps = {
  name: string;
  state: string;
};

export const ConnectorStatusIcon: FC<ConnectorStatusIconProps> = ({
  name,
  state,
}) => {
  switch (state?.toLowerCase()) {
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

export function convertToLabel(state: string) {
  return typeof state !== undefined ? capitalize(state) : 'Undefined';
}
