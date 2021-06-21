import React, { FunctionComponent, useRef, useState } from 'react';
import {
  PaginatedApiRequest,
  useConnectorsMachineIsReady,
  useConnectorsMachine,
} from '@cos-ui/machines';
import {
  PageSection,
  ToolbarItem,
  InputGroup,
  TextInput,
  Button,
  ToolbarToggleGroup,
  ToolbarGroup,
  Pagination,
  Toolbar,
  ToolbarContent,
  ButtonVariant,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import {
  useDebounce,
  NoMatchFound,
  Loading,
  EmptyState,
  EmptyStateVariant,
} from '@cos-ui/utils';
import {
  ConnectorsMachineProvider,
  useConnectorsMachineService,
} from '@cos-ui/machines';
import { NavLink, useHistory } from 'react-router-dom';
import { useAppContext } from './AppContext';
import { ConnectorTableView } from './ConnectorTableView';
import { useTranslation } from 'react-i18next';
import { ConnectorDrawer } from './ConnectorDrawer';
import { Connector } from '@cos-ui/api';

export const ConnectedConnectorsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { basePath, authToken } = useAppContext();
  const [
    selectedConnectors,
    setSelectedConnectors,
  ] = useState<Connector | null>(null);
  const onDrawerClose = () => {
    setSelectedConnectors(null);
  };
  return (
    <ConnectorsMachineProvider authToken={authToken} basePath={basePath}>
      <ConnectorDrawer
        isExpanded={selectedConnectors != null}
        selectedConnectors={selectedConnectors}
        onClose={onDrawerClose}
      >
        <PageSection variant={'light'}>
          <TextContent>
            <Title headingLevel="h1">{t('managedConnectors')}</Title>
          </TextContent>
        </PageSection>
        <PageSection variant={'light'} padding={{ default: 'noPadding' }}>
          <ConnectorsPage selectConnector={setSelectedConnectors} />
        </PageSection>
      </ConnectorDrawer>
    </ConnectorsMachineProvider>
  );
};

export type ConnectorsPageProps = {
  selectConnector: (conn: Connector | null) => void;
};

export const ConnectorsPage: FunctionComponent<ConnectorsPageProps> = ({
  selectConnector,
}: ConnectorsPageProps) => {
  const service = useConnectorsMachineService();
  const isReady = useConnectorsMachineIsReady(service);
  return isReady ? <ConnectorsTable selectConnector={selectConnector} /> : null;
};

export type ConnectorsTableProps = {
  selectConnector: (conn: Connector | null) => void;
};

const ConnectorsTable: FunctionComponent<ConnectorsTableProps> = ({
  selectConnector,
}: ConnectorsTableProps) => {
  const history = useHistory();
  const service = useConnectorsMachineService();
  const {
    response,
    loading,
    error,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
  } = useConnectorsMachine(service);

  switch (true) {
    case firstRequest:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <Loading />
        </PageSection>
      );
    case queryEmpty:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <NoMatchFound
            onClear={() => service.send({ type: 'query', page: 1, size: 10 })}
          />
        </PageSection>
      );
    case loading:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <ConnectorsToolbar />
          <Loading />
        </PageSection>
      );
    case noResults || error:
      return (
        <EmptyState
          emptyStateProps={{ variant: EmptyStateVariant.GettingStarted }}
          titleProps={{ title: 'cos.welcome_to_cos' }}
          emptyStateBodyProps={{
            body: 'cos.welcome_empty_state_body',
          }}
          buttonProps={{
            title: 'cos.create_cos',
            variant: ButtonVariant.primary,
            onClick: () => history.push('/create-connector'),
          }}
        />
      );
    default:
      return (
        <ConnectorTableView data={response} selectConnector={selectConnector} />
      );
  }
};

export const ConnectorsToolbar: FunctionComponent = () => {
  const service = useConnectorsMachineService();
  const { request, response } = useConnectorsMachine(service);

  const onChange = (request: PaginatedApiRequest<{}>) =>
    service.send({ type: 'query', ...request });
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnChange = useDebounce(onChange, 1000);
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

  // const [statuses, setStatuses] = useState<string[]>([
  //   'Pending',
  //   'Created',
  //   'Cancelled',
  // ]);
  // const [statusesToggled, setStatusesToggled] = useState(false);
  // const clearAllFilters = useCallback(() => {
  //   setSearchValue('');
  //   setStatuses([]);
  // }, []);
  // const toggleStatuses = useCallback(
  //   () => setStatusesToggled(prev => !prev),
  //   []
  // );
  // const onSelectStatus = useCallback(
  //   (_, status) =>
  //     setStatuses(prev =>
  //       prev.includes(status)
  //         ? prev.filter(s => s !== status)
  //         : [...prev, status]
  //     ),
  //   []
  // );

  // const statusMenuItems = [
  //   <SelectOption key="statusPending" value="Pending" />,
  //   <SelectOption key="statusCreated" value="Created" />,
  //   <SelectOption key="statusCancelled" value="Cancelled" />,
  // ];

  // ensure the search input value reflects what's specified in the request object
  // useEffect(() => {
  //   if (searchInputRef.current) {
  //     searchInputRef.current.value = (request.name as string | undefined) || '';
  //   }
  // }, [searchInputRef, request]);

  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <InputGroup>
          <TextInput
            name="textInput2"
            id="textInput2"
            type="search"
            aria-label="search input example"
            onChange={value =>
              debouncedOnChange({
                size: request.size,
                page: 1,
                name: value,
              })
            }
            ref={searchInputRef}
          />
          <Button
            variant={'control'}
            aria-label="search button for search input"
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>
      {/* <ToolbarGroup variant="filter-group">
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
      </ToolbarGroup> */}
    </>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <NavLink
            className="pf-c-button pf-m-primary"
            to={'/create-connector'}
          >
            Create Connector
          </NavLink>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <Pagination
          itemCount={response?.total || 0}
          page={request.page}
          perPage={request.size}
          perPageOptions={defaultPerPageOptions}
          onSetPage={(_, page, size) =>
            onChange({ ...request, page, size: size || request.size })
          }
          onPerPageSelect={() => false}
          variant="top"
          isCompact
        />
      </ToolbarItem>
    </>
  );

  return (
    <Toolbar
      id="toolbar-group-types"
      collapseListedFiltersBreakpoint="xl"
      // clearAllFilters={clearAllFilters}
    >
      <ToolbarContent>{toolbarItems}</ToolbarContent>
    </Toolbar>
  );
};
