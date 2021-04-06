import { useState } from 'react';
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useActor } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { connectorsMachine } from '@kas-connectors/machines';
import React from 'react';

export type SelectConnectorProps = {
  actor: ActorRefFrom<typeof connectorsMachine>;
};

export function SelectConnector({ actor }: SelectConnectorProps) {
  const [state, send] = useActor(actor);
  const [toggled, setToggled] = useState(false);

  const onToggle = () => setToggled(!toggled);
  const onSelect = (id: string) => {
    send({ type: 'selectConnector', selectedConnector: id });
    onToggle();
  };

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
            Select connector
          </Title>
          <DataList
            aria-label="Select connector"
            selectedDataListItemId={state.context.selectedConnector?.id}
            onSelectDataListItem={onSelect}
          >
            {state.context.connectors?.items.map(type => (
              <DataListItem
                aria-labelledby="simple-item1"
                key={type.id}
                id={type.id}
              >
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="logo" isFilled={false}>
                        <img src="https://placekitten.com/50/50" />
                      </DataListCell>,
                      <DataListCell key="secondary content" isFilled>
                        <TextContent>
                          <Text component={TextVariants.h5}>{type.name}</Text>
                          <Text>{type.description}</Text>
                        </TextContent>
                      </DataListCell>,
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            ))}
          </DataList>
        </div>
      );
  }
}
