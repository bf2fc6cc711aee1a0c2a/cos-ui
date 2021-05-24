import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { useInterpret, useSelector } from '@xstate/react';
import { makeConnectorsMachine, PaginatedApiRequest } from '@cos-ui/machines';
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
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { useDebounce, NoMatchFound, Loading } from '@cos-ui/utils';
import { useAppContext } from './AppContext';
import { InterpreterFrom } from 'xstate';
import { NavLink } from 'react-router-dom';

export const ConnectorsPage: FunctionComponent = () => {
  const { basePath, authToken } = useAppContext();
  const service = useInterpret(makeConnectorsMachine({ authToken, basePath }));
  const { request, itemCount } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        request: state.context.request,
        itemCount: state.context.connectors?.total,
      }),
      [service]
    )
  );
  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <ConnectorsToolbar
        request={request}
        itemCount={itemCount}
        onChange={request => service.send({ type: 'query', ...request })}
      />
      <ConnectorsTable service={service} />
    </PageSection>
  );
};

type ConnectorsTableProps = {
  service: InterpreterFrom<ReturnType<typeof makeConnectorsMachine>>;
};
const ConnectorsTable: FunctionComponent<ConnectorsTableProps> = ({
  service,
}) => {
  const { connectors, isLoading } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        connectors: state.context.connectors?.items || [],
        isLoading: state.hasTag('loading'),
      }),
      [service]
    )
  );
  switch (true) {
    case isLoading:
      return <Loading />;
    case connectors.length === 0:
      return (
        <NoMatchFound
          onClear={() => service.send({ type: 'query', page: 1, size: 10 })}
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
      const rows = connectors.map(c => [
        c.metadata?.created_at,
        c.metadata?.resource_version,
        c.metadata?.owner,
        c.metadata?.created_at,
        c.metadata?.updated_at,
        c.status,
      ]);
      return (
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
      );
  }
};

type ConnectorsToolbarProps = {
  itemCount?: number;
  request: PaginatedApiRequest;
  onChange: (query: PaginatedApiRequest) => void;
};
const ConnectorsToolbar: FunctionComponent<ConnectorsToolbarProps> = ({
  itemCount = 0,
  request,
  onChange,
}) => {
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
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = (request.name as string | undefined) || '';
    }
  }, [searchInputRef, request]);

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
          itemCount={itemCount}
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
