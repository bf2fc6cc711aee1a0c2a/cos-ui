import React, { FunctionComponent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { Connector } from '@cos-ui/api';
import {
  ConnectorWithActorRef,
  PaginatedApiRequest,
  PaginatedApiResponse,
  useConnectorsMachine,
  useConnectorsMachineService,
  connectorMachine,
} from '@cos-ui/machines';
import { useDebounce } from '@cos-ui/utils';
import {
  Button,
  InputGroup,
  PageSection,
  Pagination,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import {
  IActions,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useActor } from '@xstate/react';
import { css } from '@patternfly/react-styles';
import './ConnectorTableView.css';

export type ConnectorTableViewProps = {
  data: PaginatedApiResponse<ConnectorWithActorRef> | undefined;
  selectConnector: (conn: Connector | null) => void;
  activeRow: string;
  setActiveRow: (currentRow: string) => void;
};

export const ConnectorTableView: FunctionComponent<ConnectorTableViewProps> = ({
  data,
  activeRow,
  setActiveRow,
  selectConnector,
}: ConnectorTableViewProps) => {
  const { t } = useTranslation();
  const rowClick = (c: Connector) => {
    selectConnector(c);
    setActiveRow(c.id || '');
  };
  return (
    <PageSection padding={{ default: 'noPadding' }} isFilled>
      <ConnectorsToolbar />

      <TableComposable
        aria-label="Sortable Table"
        className={css('connector-table-view__table')}
      >
        <Thead>
          <Tr>
            <Th>{t('id')}</Th>
            <Th>{t('name')}</Th>
            <Th>{t('type')}</Th>
            <Th>{t('category')}</Th>
            <Th>{t('status')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.items?.map(connector => (
            <ConnectorRow
              activeRow={activeRow}
              onClick={() => rowClick(connector)}
              connector={connector}
              key={connector.id}
            />
          ))}
        </Tbody>
      </TableComposable>
    </PageSection>
  );
};

type ConnectorRowProps = {
  activeRow: string;
  connector: ConnectorWithActorRef;
  onClick: () => void;
};
export const ConnectorRow: FunctionComponent<ConnectorRowProps> = ({
  activeRow,
  connector,
  onClick,
}) => {
  const { t } = useTranslation();
  const [state, send] = useActor(connector.ref);

  const actions: IActions = [
    {
      title: 'Start',
      onClick: () => send({ type: 'start' }),
      isDisabled: connectorMachine.transition(state, 'start').changed === false,
    },
    {
      title: 'Stop',
      onClick: () => send({ type: 'stop' }),
      isDisabled: connectorMachine.transition(state, 'stop').changed === false,
    },
    {
      title: 'Delete',
      onClick: () => send({ type: 'remove' }),
      isDisabled:
        connectorMachine.transition(state, 'remove').changed === false,
    },
    {
      isSeparator: true,
    },
    {
      title: 'Overview',
      onClick,
    },
  ];

  return (
    <Tr
      onClick={event => {
        // send the event only if the click didn't happen on the actions button
        if ((event.target as any | undefined)?.type !== 'button') {
          onClick();
        }
      }}
      className={css(
        'pf-c-table-row__item',
        'pf-m-selectable',
        activeRow && activeRow === connector.id && 'pf-m-selected'
      )}
    >
      <Td dataLabel={t('id')}>{connector.id}</Td>
      <Td dataLabel={t('name')}>{connector.metadata?.name}</Td>
      <Td dataLabel={t('type')}>{connector.connector_type_id}</Td>
      <Td dataLabel={t('category')}>TODO: MISSING</Td>
      <Td dataLabel={t('status')}>{connector.status}</Td>
      <Td actions={{ items: actions }} />
    </Tr>
  );
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
