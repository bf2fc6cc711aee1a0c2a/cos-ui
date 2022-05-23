import { capitalize } from 'lodash';
import React, { FC, ReactNode } from 'react';

import {
  Split,
  SplitItem,
  Spinner,
  Stack,
  StackItem,
  Button,
  Popover,
  PopoverPosition,
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
  clickable?: boolean;
  popoverBody?: ReactNode;
  popoverHeader?: ReactNode;
};

export const ConnectorStatus: FC<ConnectorStatusProps> = ({
  desiredState,
  name,
  state,
  clickable,
  popoverBody,
  popoverHeader,
}) => (
  <Split className={'connector-status__split'} hasGutter>
    <SplitItem>
      <ConnectorStatusIcon name={name} state={state} />
    </SplitItem>
    <SplitItem isFilled>
      <ConnectorStatusLabel
        desiredState={desiredState}
        state={state}
        clickable={clickable}
        popoverBody={popoverBody}
        popoverHeader={popoverHeader}
      />
    </SplitItem>
  </Split>
);

type ConnectorStatusLabelProps = {
  desiredState: string;
  state: string;
  clickable: boolean | undefined;
  popoverBody: ReactNode;
  popoverHeader: ReactNode;
};

export const ConnectorStatusLabel: FC<ConnectorStatusLabelProps> = ({
  desiredState,
  state,
  clickable,
  popoverBody,
  popoverHeader,
}) => {
  switch (state?.toLowerCase()) {
    case 'ready':
    case 'failed':
    case 'stopped':
    case 'deleted':
    case '':
      return (
        <>
          {clickable ? (
            <Popover
              aria-label="connector status popover"
              position={PopoverPosition.auto}
              hideOnOutsideClick={true}
              headerContent={popoverHeader}
              bodyContent={popoverBody}
            >
              <Button variant="link" isInline>
                {convertToLabel(state)}
              </Button>
            </Popover>
          ) : (
            convertToLabel(state)
          )}
        </>
      );
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
