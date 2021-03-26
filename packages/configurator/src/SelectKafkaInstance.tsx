import { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { useActor } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { kafkaInstancesMachine } from '@kas-connectors/machines';
import React from 'react';

const EMPTY_KEY = "__empty__"

export type SelectKafkaInstanceProps = {
  actor: ActorRefFrom<typeof kafkaInstancesMachine>;
};

export function SelectKafkaInstance({ actor }: SelectKafkaInstanceProps) {
  const [state, send] = useActor(actor);
  const [toggled, setToggled] = useState(false);

  const onToggle = () => setToggled(!toggled);
  const onSelect = (_event: any, value: string | SelectOptionObject) => {
    send({ type: 'selectInstance', data: value });
    onToggle();
  }

  const instancesWithEmpty = [
    { id: EMPTY_KEY, name: "Please select an instance"},
    ...(state.context.instances || [])
  ]

  return state.matches('loading') ? (
    <Spinner />
  ) : (
    <div>
      <Title headingLevel="h2" id="select-kafka-instance-title">
        Select Kafka instance
      </Title>
      <Select
        variant={SelectVariant.single}
        aria-label="Select Input"
        onToggle={onToggle}
        onSelect={onSelect}
        selections={state.context.selectedInstance || EMPTY_KEY}
        isOpen={toggled}
        aria-labelledby={'select-kafka-instance-title'}
      >      
        {instancesWithEmpty.map((i, idx) => (
          <SelectOption key={idx} value={i.id} isPlaceholder={i.id === EMPTY_KEY}>
            {i.name}
          </SelectOption>
        ))}
      </Select>
    </div>
  );
}
