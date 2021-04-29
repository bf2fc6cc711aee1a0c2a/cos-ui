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
import { ClusterMachineActorRef } from '@cos-ui/machines';
import React, { Fragment, useCallback, useState } from 'react';

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

export type SelectClusterProps = {
  actor: ClusterMachineActorRef;
};

export function SelectCluster({ actor }: SelectClusterProps) {
  const [state, send] = useActor(actor);
  const [searchValue, setSearchValue] = useState('');
  const [statuses, setStatuses] = useState<string[]>([
    'Pending',
    'Created',
    'Cancelled',
  ]);
  const [statusesToggled, setStatusesToggled] = useState(false);
  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setStatuses([]);
  }, []);
  const toggleStatuses = useCallback(
    () => setStatusesToggled(prev => !prev),
    []
  );
  const onSelectStatus = useCallback(
    (_, status) =>
      setStatuses(prev =>
        prev.includes(status)
          ? prev.filter(s => s !== status)
          : [...prev, status]
      ),
    []
  );
  const onSelect = (selectedCluster: string) => {
    send({ type: 'selectCluster', selectedCluster });
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
        <Fragment>
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
        </Fragment>
      );
      const toolbarItems = (
        <>
          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
            {toggleGroupItems}
          </ToolbarToggleGroup>
          <ToolbarGroup variant="icon-button-group">
            <ToolbarItem>
              <Button variant="primary">Create OCM Cluster</Button>
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem
            variant="pagination"
            alignment={{ default: 'alignRight' }}
          >
            <Pagination
              itemCount={state.context.clusters?.total || 0}
              page={(state.context.clusters?.page || 0) + 1}
              perPage={state.context.clusters?.size || 0}
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
              {state.context.clusters?.items
                .filter(i =>
                  searchValue !== ''
                    ? i.metadata!.name!.includes(searchValue)
                    : true
                )
                .map(i => (
                  <Card
                    isHoverable
                    key={i.id}
                    isSelectable
                    isSelected={state.context.selectedCluster?.id === i.id}
                    onClick={() => onSelect(i.id!)}
                  >
                    <CardHeader>
                      <CardTitle>{i.metadata?.name}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Group</DescriptionListTerm>
                          <DescriptionListDescription>
                            {i.metadata?.group}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Owner</DescriptionListTerm>
                          <DescriptionListDescription>
                            {i.metadata?.owner}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Created</DescriptionListTerm>
                          <DescriptionListDescription>
                            {i.metadata?.created_at}
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
