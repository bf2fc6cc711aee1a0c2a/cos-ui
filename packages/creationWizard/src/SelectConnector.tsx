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
import React, { FunctionComponent, useCallback, useState } from 'react';
import { NoMatchFound } from '@cos-ui/utils';
import { useCreationWizardMachineConnectorTypesActor } from '@cos-ui/machines';
import { useTranslation } from 'react-i18next';
import { BodyLayout } from './BodyLayout';

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
  const { t } = useTranslation();
  const actor = useCreationWizardMachineConnectorTypesActor();
  const [searchValue, setSearchValue] = useState('');
  const onSelect = (selectedConnector: string) => {
    actor.send({ type: 'selectConnector', selectedConnector });
  };
  const connectors = actor.state.context.connectors?.items.filter(i =>
    searchValue !== '' ? i.name!.includes(searchValue) : true
  );

  return (
    <BodyLayout
      title={t('Connector category')}
      description={
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit error adipisci, ducimus ipsum dicta quo beatae ratione aliquid nostrum animi eos, doloremque laborum quasi sed, vitae ipsa illo delectus! Quos'
      }
    >
      {(() => {
        switch (true) {
          case actor.state.matches('loading'):
            return (
              <EmptyState>
                <EmptyStateIcon variant="container" component={Spinner} />
                <Title size="lg" headingLevel="h4">
                  Loading
                </Title>
              </EmptyState>
            );
          case actor.state.matches('failure'):
            return <NoMatchFound />;
          case !connectors || connectors.length === 0:
            return (
              <>
                <ConnectorsToolbar
                  searchValue={searchValue}
                  onSearch={setSearchValue}
                />
                <div className="pf-u-p-md">
                  <NoMatchFound />;
                </div>
              </>
            );
          default:
            return (
              <>
                <ConnectorsToolbar
                  searchValue={searchValue}
                  onSearch={setSearchValue}
                />
                <div className="pf-u-p-md">
                  <Gallery hasGutter>
                    {connectors?.map(c => (
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
                <ConnectorsPagination />
              </>
            );
        }
      })()}
    </BodyLayout>
  );
}

type ConnectorsToolbarProps = {
  searchValue: string;
  onSearch: (value: string) => void;
};
const ConnectorsToolbar: FunctionComponent<ConnectorsToolbarProps> = ({
  searchValue,
  onSearch,
}) => {
  const [types, setTypes] = useState<string[]>(['Sink', 'Source']);
  const [typesToggled, setTypesToggled] = useState(false);
  const clearAllFilters = useCallback(() => {
    onSearch('');
    setTypes([]);
  }, [onSearch]);
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
            onChange={onSearch}
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
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <ConnectorsPagination isCompact />
      </ToolbarItem>
    </>
  );
  return (
    <Toolbar
      id="toolbar-group-types"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={clearAllFilters}
    >
      <ToolbarContent>{toolbarItems}</ToolbarContent>
    </Toolbar>
  );
};

type ConnectorsPaginationProps = {
  isCompact?: boolean;
};
const ConnectorsPagination: FunctionComponent<ConnectorsPaginationProps> = ({
  isCompact = false,
}) => {
  const actor = useCreationWizardMachineConnectorTypesActor();
  return (
    <Pagination
      itemCount={actor.state.context.connectors?.total || 0}
      page={(actor.state.context.connectors?.page || 0) + 1}
      perPage={actor.state.context.connectors?.size || 0}
      perPageOptions={defaultPerPageOptions}
      onSetPage={() => false}
      onPerPageSelect={() => false}
      variant={isCompact ? 'top' : 'bottom'}
      isCompact={isCompact}
    />
  );
};
