import './ConnectorTableView.css';

import React, { FunctionComponent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { Connector } from '@cos-ui/api';
import {
  ConnectorMachineActorRef,
  PaginatedApiRequest,
  PaginatedApiResponse,
  useConnector,
  useConnectorsMachine,
  useConnectorsMachineService,
} from '@cos-ui/machines';
import { useDebounce } from '@cos-ui/utils';
import {
  Button,
  Flex,
  FlexItem,
  InputGroup,
  PageSection,
  Pagination,
  Spinner,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  FilterIcon,
  PendingIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import {
  IActions,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

export type ConnectorTableViewProps = {
  data: PaginatedApiResponse<ConnectorMachineActorRef> | undefined;
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
          {data?.items?.map(ref => (
            <ConnectorRow
              activeRow={activeRow}
              onClick={rowClick}
              connectorRef={ref}
              key={ref.id}
            />
          ))}
        </Tbody>
      </TableComposable>
    </PageSection>
  );
};

type ConnectorRowProps = {
  activeRow: string;
  connectorRef: ConnectorMachineActorRef;
  onClick: (connector: Connector) => void;
};
export const ConnectorRow: FunctionComponent<ConnectorRowProps> = ({
  activeRow,
  connectorRef,
  onClick,
}) => {
  const { t } = useTranslation();
  const {
    connector,
    canStart,
    canStop,
    canDelete,
    onStart,
    onStop,
    onDelete,
  } = useConnector(connectorRef);

  const actions: IActions = [
    {
      title: 'Start',
      onClick: onStart,
      isDisabled: !canStart,
    },
    {
      title: 'Stop',
      onClick: onStop,
      isDisabled: !canStop,
    },
    {
      title: 'Delete',
      onClick: onDelete,
      isDisabled: !canDelete,
    },
    {
      isSeparator: true,
    },
    {
      title: 'Overview',
      onClick: () => onClick(connector),
    },
  ];

  const statusOptions = [
    { value: 'ready', label: t('Ready') },
    { value: 'failed', label: t('Failed') },
    { value: 'assigning', label: t('Creation pending') },
    { value: 'assigned', label: t('Creation in progress') },
    { value: 'updating', label: t('Creation in progress') },
    { value: 'provisioning', label: t('Creation in progress') },
    { value: 'deleting', label: t('Deletion in progress') },
    { value: 'deleted', label: t('Deletion in progress') },
  ];

  const getStatusLabel = (status: string) =>
    statusOptions.find(s => s.value === status)?.label || status;

  return (
    <Tr
      onClick={event => {
        // send the event only if the click didn't happen on the actions button
        if ((event.target as any | undefined)?.type !== 'button') {
          onClick(connector);
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
      <Td dataLabel={t('status')}>
        <Flex>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <ConnectorStatusIcon
              id={connector.id!}
              status={connector.status!}
            />
          </FlexItem>
          <FlexItem>{getStatusLabel(connector.status!)}</FlexItem>
        </Flex>
      </Td>
      <Td actions={{ items: actions }} />
    </Tr>
  );
};

type ConnectorStatusIconProps = {
  id: string;
  status: string;
};
const ConnectorStatusIcon: FunctionComponent<ConnectorStatusIconProps> = ({
  id,
  status,
}) => {
  switch (status?.toLowerCase()) {
    case 'ready':
      return (
        <CheckCircleIcon className="mk--instances__table--icon--completed" />
      );
    case 'failed':
      return (
        <ExclamationCircleIcon className="mk--instances__table--icon--failed" />
      );
    case 'accepted':
      return <PendingIcon />;
    case 'provisioning':
    case 'preparing':
      return (
        <Spinner
          size="md"
          aria-label={id}
          aria-valuetext="Creation in progress"
        />
      );
    case 'deprovision':
    case 'deleted':
      return null;
  }
  return <PendingIcon />;
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
