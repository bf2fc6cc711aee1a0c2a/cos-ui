import React, { FunctionComponent, useRef } from 'react';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
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

export const ConnectedConnectorsPage: FunctionComponent = () => {
  const { basePath, authToken } = useAppContext();
  return (
    <ConnectorsMachineProvider authToken={authToken} basePath={basePath}>
      <ConnectorsPage />
    </ConnectorsMachineProvider>
  );
};

export const ConnectorsPage: FunctionComponent = () => {
  const service = useConnectorsMachineService();
  const isReady = useConnectorsMachineIsReady(service);
  return isReady ? <ConnectorsTable /> : null;
};

const ConnectorsTable: FunctionComponent = () => {
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
      const columns = [
        'Connector',
        'Version',
        'Owner',
        'Time Created',
        'Time Updated',
        'Status',
      ];
      const rows = response?.items?.map(c => [
        c.metadata?.created_at,
        c.metadata?.resource_version,
        c.metadata?.owner,
        c.metadata?.created_at,
        c.metadata?.updated_at,
        c.status,
      ]);
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <ConnectorsToolbar />

          <Table
            aria-label="Sortable Table"
            variant={'compact'}
            sortBy={{}}
            onSort={() => false}
            cells={columns}
            rows={rows}
            className="pf-m-no-border-rows"
          >
            <TableHeader />
            <TableBody />
          </Table>
        </PageSection>
      );
  }
};

const ConnectorsToolbar: FunctionComponent = () => {
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
