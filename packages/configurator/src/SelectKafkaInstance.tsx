import { useState } from 'react';
import {
  EmptyState,
  EmptyStateIcon,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useActor } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { kafkaInstancesMachine } from '@kas-connectors/machines';
import React from 'react';

const EMPTY_KEY = '__empty__';

export type SelectKafkaInstanceProps = {
  actor: ActorRefFrom<typeof kafkaInstancesMachine>;
};

export function SelectKafkaInstance({ actor }: SelectKafkaInstanceProps) {
  const [state, send] = useActor(actor);
  const [toggled, setToggled] = useState(false);

  const onToggle = () => setToggled(!toggled);
  const onSelect = (_event: any, value: string | SelectOptionObject) => {
    send({ type: 'selectInstance', selectedInstance: value as string });
    onToggle();
  };

  const instancesWithEmpty = [
    { id: EMPTY_KEY, name: 'Please select an instance' },
    ...(state.context.instances?.items || []).map(i => ({ id: i.id, name: i.name })),
  ];

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
          <Select
            variant={SelectVariant.single}
            aria-label="Select Input"
            onToggle={onToggle}
            onSelect={onSelect}
            selections={state.context.selectedInstance?.id || EMPTY_KEY}
            isOpen={toggled}
            aria-labelledby={'select-kafka-instance-title'}
          >
            {instancesWithEmpty.map((i, idx) => (
              <SelectOption
                key={idx}
                value={i.id}
                isPlaceholder={i.id === EMPTY_KEY}
              >
                {i.name}
              </SelectOption>
            ))}
          </Select>
        </div>
      );
  }
}
