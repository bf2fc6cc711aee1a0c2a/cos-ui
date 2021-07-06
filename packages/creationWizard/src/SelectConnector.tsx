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
import React, { useCallback, useState } from 'react';
import { NoMatchFound } from '@cos-ui/utils';
import { useCreationWizardMachineConnectorTypesActor } from '@cos-ui/machines';

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

export function SelectConnector() {
  const actor = useCreationWizardMachineConnectorTypesActor();
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
    actor.send({ type: 'selectConnector', selectedConnector });
  };

  switch (true) {
    case actor.state.matches('loading'):
      return (
        <div className={'pf-u-display-flex'}>
          <EmptyState>
            <EmptyStateIcon variant="container" component={Spinner} />
            <Title size="lg" headingLevel="h4">
              Loading
            </Title>
          </EmptyState>
        </div>
      );
    case actor.state.matches('failure'):
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
              itemCount={actor.state.context.connectors?.total || 0}
              page={(actor.state.context.connectors?.page || 0) + 1}
              perPage={actor.state.context.connectors?.size || 0}
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
        <div className={'pf-l-stack pf-u-background-color-200'}>
          <Toolbar
            id="toolbar-group-types"
            collapseListedFiltersBreakpoint="xl"
            clearAllFilters={clearAllFilters}
          >
            <ToolbarContent>{toolbarItems}</ToolbarContent>
          </Toolbar>
          <div className="pf-u-p-md">
            <Gallery hasGutter>
              {actor.state.context.connectors?.items
                .filter(i =>
                  searchValue !== '' ? i.name!.includes(searchValue) : true
                )
                .map(c => (
                  <Card
                    isHoverable
                    key={c.id}
                    isSelectable
                    isSelected={
                      actor.state.context.selectedConnector?.id === c.id
                    }
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
          </div>
        </div>
      );
  }
}
