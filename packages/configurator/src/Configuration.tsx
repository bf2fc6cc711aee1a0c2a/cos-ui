import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useActor } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { configuratorMachine } from '@kas-connectors/machines';
import React from 'react';

export type ConfigurationProps = {
  actor: ActorRefFrom<typeof configuratorMachine>;
};

export function Configuration({ actor }: ConfigurationProps) {
  const [state, send] = useActor(actor);
  const { Configurator, activeStep, connector, configuration } = state.context;
  switch (true) {
    case state.matches('loading'):
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );
    case state.matches('failure'):
      return (
        <EmptyState>
          <EmptyStateIcon icon={ExclamationCircleIcon} />
          <Title size="lg" headingLevel="h4">
            Error message
          </Title>
        </EmptyState>
      );
    default:
      return (
        <div>
          <Title headingLevel="h2" id="select-kafka-instance-title">
            Select Kafka instance
          </Title>
          {Configurator ? (
            <Configurator
              activeStep={activeStep!}
              configuration={configuration}
              connector={connector}
              onChange={(configuration, isValid) =>
                send({ type: 'configurationChange', configuration, isValid })
              }
            />
          ) : (
            <p>TODO json-schema based form</p>
          )}
        </div>
      );
  }
}
