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
import {
  ExclamationCircleIcon,
  FilterIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { useActor } from '@xstate/react';
import { KafkaMachineActorRef } from '@kas-connectors/machines';
import React from 'react';

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

export type SelectKafkaInstanceProps = {
  actor: KafkaMachineActorRef;
};

export function SelectKafkaInstance({ actor }: SelectKafkaInstanceProps) {
  const [state, send] = useActor(actor);
  const [searchValue, setSearchValue] = React.useState('');
  const [statuses, setStatuses] = React.useState<string[]>([
    'Pending',
    'Created',
    'Cancelled',
  ]);
  const [statusesToggled, setStatusesToggled] = React.useState(false);
  const clearAllFilters = React.useCallback(() => {
    setSearchValue('');
    setStatuses([]);
  }, []);
  const toggleStatuses = React.useCallback(
    () => setStatusesToggled(prev => !prev),
    []
  );
  const onSelectStatus = React.useCallback(
    (_, status) =>
      setStatuses(prev =>
        prev.includes(status)
          ? prev.filter(s => s !== status)
          : [...prev, status]
      ),
    []
  );

  const onSelect = (selectedInstance: string) => {
    send({ type: 'selectInstance', selectedInstance });
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
      const statusMenuItems = [
        <SelectOption key="statusPending" value="Pending" />,
        <SelectOption key="statusCreated" value="Created" />,
        <SelectOption key="statusCancelled" value="Cancelled" />,
      ];
      const toggleGroupItems = (
        <React.Fragment>
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
              chips={statuses}
              deleteChip={onSelectStatus}
              deleteChipGroup={() => setStatuses([])}
              categoryName="Status"
            >
              <Select
                variant={'checkbox'}
                aria-label="Status"
                onToggle={toggleStatuses}
                onSelect={onSelectStatus}
                selections={statuses}
                isOpen={statusesToggled}
                placeholderText="Status"
              >
                {statusMenuItems}
              </Select>
            </ToolbarFilter>
          </ToolbarGroup>
        </React.Fragment>
      );
      const toolbarItems = (
        <>
          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
            {toggleGroupItems}
          </ToolbarToggleGroup>
          <ToolbarGroup variant="icon-button-group">
            <ToolbarItem>
              <Button variant="primary">Create Kafka Instance</Button>
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem
            variant="pagination"
            alignment={{ default: 'alignRight' }}
          >
            <Pagination
              itemCount={state.context.instances?.total || 0}
              page={(state.context.instances?.page || 0) + 1}
              perPage={state.context.instances?.size || 0}
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
              {state.context.instances?.items
                .filter(i =>
                  searchValue !== '' ? i.name!.includes(searchValue) : true
                )
                .map(i => (
                  <Card
                    isHoverable
                    key={i.id}
                    isSelectable
                    isSelected={state.context.selectedInstance?.id === i.id}
                    onClick={() => onSelect(i.id!)}
                  >
                    <CardHeader>
                      <CardTitle>{i.name}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Region</DescriptionListTerm>
                          <DescriptionListDescription>
                            {i.region}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Owner</DescriptionListTerm>
                          <DescriptionListDescription>
                            {i.owner}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Created</DescriptionListTerm>
                          <DescriptionListDescription>
                            {i.created_at}
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
