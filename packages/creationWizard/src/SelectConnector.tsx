import { ConnectorTypesMachineActorRef } from '@cos-ui/machines';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateIcon,
  Gallery,
  InputGroup,
  PageSection,
  Pagination,
  Select,
  SelectOption,
  Spinner,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { useActor } from '@xstate/react';
import React, { useCallback, useState } from 'react';
import { NoMatchFound } from './NoMatchFound';

const defaultPerPageOptions = [
  {
    title: '1',
    value: 1,
  },
  {
    title: '5',
    value: 5,
  },
  {
    title: '10',
    value: 10,
  },
];

export type SelectConnectorProps = {
  actor: ConnectorTypesMachineActorRef;
};

export function SelectConnector({ actor }: SelectConnectorProps) {
  const [state, send] = useActor(actor);
  const [searchValue, setSearchValue] = useState('');
  const [types, setTypes] = useState<string[]>(['Sink', 'Source']);
  const [typesToggled, setTypesToggled] = useState(false);
  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setTypes([]);
  }, []);
  const toggleTypes = useCallback(() => setTypesToggled(prev => !prev), []);
  const onSelectType = useCallback(
    (_, status) =>
      setTypes(prev =>
        prev.includes(status)
          ? prev.filter(s => s !== status)
          : [...prev, status]
      ),
    []
  );
  const onSelect = (selectedConnector: string) => {
    send({ type: 'selectConnector', selectedConnector });
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
      return <NoMatchFound />;
    default:
      const typeMenuItems = [
        <SelectOption key="Sink" value="Sink" />,
        <SelectOption key="Source" value="Source" />,
      ];
      const toggleGroupItems = (
        <>
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name="textInput2"
                id="textInput2"
                type="search"
                aria-label="search input example"
                onChange={setSearchValue}
                value={searchValue}
              />
              <Button
                variant={'control'}
                aria-label="search button for search input"
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
          <ToolbarGroup variant="filter-group">
            <ToolbarFilter
              chips={types}
              deleteChip={onSelectType}
              deleteChipGroup={() => setTypes([])}
              categoryName="Connector type"
            >
              <Select
                variant={'checkbox'}
                aria-label="Connector type"
                onToggle={toggleTypes}
                onSelect={onSelectType}
                selections={types}
                isOpen={typesToggled}
                placeholderText="Connector type"
              >
                {typeMenuItems}
              </Select>
            </ToolbarFilter>
          </ToolbarGroup>
        </>
      );
      const toolbarItems = (
        <>
          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
            {toggleGroupItems}
          </ToolbarToggleGroup>
          <ToolbarItem
            variant="pagination"
            alignment={{ default: 'alignRight' }}
          >
            <Pagination
              itemCount={state.context.connectors?.total || 0}
              page={(state.context.connectors?.page || 0) + 1}
              perPage={state.context.connectors?.size || 0}
              perPageOptions={defaultPerPageOptions}
              onSetPage={() => false}
              onPerPageSelect={() => false}
              variant="top"
              isCompact
            />
          </ToolbarItem>
        </>
      );
      return (
        <PageSection padding={{ default: 'noPadding' }}>
          <Toolbar
            id="toolbar-group-types"
            collapseListedFiltersBreakpoint="xl"
            clearAllFilters={clearAllFilters}
          >
            <ToolbarContent>{toolbarItems}</ToolbarContent>
          </Toolbar>
          <PageSection isFilled>
            <Gallery hasGutter>
              {state.context.connectors?.items
                .filter(i =>
                  searchValue !== '' ? i.name!.includes(searchValue) : true
                )
                .map(c => (
                  <Card
                    isHoverable
                    key={c.id}
                    isSelectable
                    isSelected={state.context.selectedConnector?.id === c.id}
                    onClick={() => onSelect(c.id!)}
                  >
                    <CardHeader>
                      <CardTitle>{c.name}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListDescription>
                            {c.description}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Version</DescriptionListTerm>
                          <DescriptionListDescription>
                            {c.version}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>ID</DescriptionListTerm>
                          <DescriptionListDescription>
                            {c.id}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>
                  </Card>
                ))}
            </Gallery>
          </PageSection>
        </PageSection>
      );
  }
}
