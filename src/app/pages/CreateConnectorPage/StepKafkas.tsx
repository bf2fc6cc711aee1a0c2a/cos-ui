import {
  useKafkasMachineIsReady,
  useKafkasMachine,
} from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { EmptyStateNoKafkaInstances } from '@app/components/EmptyStateNoKafkaInstances/EmptyStateNoKafkaInstances';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { KafkaCard } from '@app/components/KafkaCard/KafkaCard';
import { Loading } from '@app/components/Loading/Loading';
import { Pagination } from '@app/components/Pagination/Pagination';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import _ from 'lodash';
import React, {
  FunctionComponent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { stringToChip } from 'src/utils/stringToChip';

import {
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  Gallery,
  Select,
  SelectOption,
  Toolbar,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

import { SearchFilter } from './components/SearchFilter';

export const SelectKafkaInstance: FunctionComponent = () => {
  const isReady = useKafkasMachineIsReady();
  return isReady ? <KafkasGallery /> : null;
};
const KafkasGallery: FunctionComponent = () => {
  const { t } = useTranslation();

  const [kafkaExpired, setKafkaExpired] = useState<boolean>(false);

  const {
    response,
    loading,
    error,
    selectedId,
    onDeselect,
    duplicateMode,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
    onSelect,
    runQuery,
  } = useKafkasMachine();

  useEffect(() => {
    if (duplicateMode && response) {
      if (response?.items?.find((i) => i.id === selectedId)) {
        onSelect(selectedId!);
      } else {
        setKafkaExpired(true);
        onDeselect();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateMode, response, onDeselect]);

  return (
    <StepBodyLayout
      title={t('kafkaInstance')}
      description={t('kafkaStepDescription')}
    >
      {(() => {
        switch (true) {
          case firstRequest:
            return <Loading />;
          case queryEmpty:
            return (
              <>
                <KafkaToolbar />
                <EmptyStateNoMatchesFound
                  onClear={() => runQuery({ page: 1, size: 10 })}
                />
              </>
            );
          case noResults || error:
            return (
              <EmptyStateNoKafkaInstances
                onCreate={() => {
                  window.open(
                    'https://console.redhat.com/application-services/streams/kafkas',
                    '_blank'
                  );
                }}
              />
            );
          case loading:
            return (
              <>
                <KafkaToolbar />
                <Loading />
              </>
            );
          default:
            return (
              <>
                <KafkaToolbar />
                <div className={'pf-l-stack__item pf-m-fill'}>
                  {duplicateMode && kafkaExpired && (
                    <Alert
                      variant="info"
                      className="pf-u-mb-md"
                      isInline
                      title={t('duplicateAlertKafka')}
                    />
                  )}
                  <Gallery hasGutter>
                    {response?.items?.map((i) => (
                      <KafkaCard
                        key={i.id}
                        id={i.id}
                        name={i.name!}
                        region={i.region!}
                        owner={i.owner!}
                        createdAt={i.created_at || ''}
                        selectedKafka={selectedId}
                        onSelect={onSelect}
                      />
                    ))}
                  </Gallery>
                </div>
              </>
            );
        }
      })()}
    </StepBodyLayout>
  );
};

const KafkaToolbar: FunctionComponent = () => {
  const { t } = useTranslation();

  const { request, runQuery } = useKafkasMachine();

  const [statusesToggled, setStatusesToggled] = useState(false);
  const [cloudProvidersToggled, setCloudProvidersToggled] = useState(false);
  const [regionsToggled, setRegionsToggled] = useState(false);
  const [categoryToggled, setCategoryToggled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Name');
  const onToggleStatuses = useCallback(
    () => setStatusesToggled((prev) => !prev),
    []
  );
  const onToggleCloudProviders = useCallback(
    () => setCloudProvidersToggled((prev) => !prev),
    []
  );
  const onToggleRegions = useCallback(
    () => setRegionsToggled((prev) => !prev),
    []
  );
  const onFilterCategoryToggle = useCallback(
    () => setCategoryToggled((prev) => !prev),
    []
  );

  const {
    name,
    owner,
    cloudProviders = [],
    regions = [],
    statuses = [],
  } = request.search || {};

  const clearAllFilters = useCallback(
    () => runQuery({ page: 1, size: request.size }),
    [runQuery, request.size]
  );

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const ownerInputRef = useRef<HTMLInputElement | null>(null);

  const onSelectFilter = (
    category: string,
    values: string[],
    value: string
  ) => {
    runQuery({
      ...request,
      search: {
        ...(request.search || {}),
        [category]: values.includes(value)
          ? values.filter((s) => s !== value)
          : [...(values || []), value],
      },
    });
  };

  const onSelectStatus = (
    _category: string | ToolbarChipGroup,
    value: string | ToolbarChip
  ) => {
    onSelectFilter('statuses', statuses, (value as ToolbarChip).key);
  };

  const onSelectCloudProvider = (
    _category: string | ToolbarChipGroup,
    value: string | ToolbarChip
  ) => {
    onSelectFilter(
      'cloudProviders',
      cloudProviders,
      (value as ToolbarChip).key
    );
  };

  const onSelectRegion = (
    _category: string | ToolbarChipGroup,
    value: string | ToolbarChip
  ) => {
    onSelectFilter('regions', regions, (value as ToolbarChip).key);
  };

  const onDeleteQueryGroup = (category: string) =>
    runQuery({
      ...request,
      search: {
        ...(request.search || {}),
        [category]: undefined,
      },
    });

  const selectCategory = useCallback(
    (event?: SyntheticEvent<HTMLDivElement, Event> | undefined) => {
      const eventTarget = event?.target as HTMLElement;
      const selectedCategory = eventTarget.innerText;
      setSelectedCategory(selectedCategory);
      setCategoryToggled((prev) => !prev);
    },
    []
  );

  // ensure the search input value reflects what's specified in the request object
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = name || '';
    }
    if (ownerInputRef.current) {
      ownerInputRef.current.value = owner || '';
    }
  }, [nameInputRef, name, owner]);

  const filterCategoryMenuItems = filterCategoryOptions.map(
    ({ value, label }) => <DropdownItem key={value}>{label}</DropdownItem>
  );
  const statusMenuItems = statusOptions
    .filter((option) => option.value !== 'preparing')
    .map(({ value, label }) => (
      <SelectOption key={value} value={value}>
        {label}
      </SelectOption>
    ));
  const cloudProviderMenuItems = cloudProviderOptions.map(
    ({ value, label }) => (
      <SelectOption key={value} value={value}>
        {label}
      </SelectOption>
    )
  );
  const regionMenuItems = regionOptions.map(({ value, label }) => (
    <SelectOption key={value} value={value}>
      {label}
    </SelectOption>
  ));

  const filterCategoryDropdown = (
    <ToolbarItem>
      <Dropdown
        onSelect={(event) => selectCategory(event)}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            onToggle={onFilterCategoryToggle}
            style={{ width: '100%' }}
          >
            <FilterIcon size="sm" /> {selectedCategory}
          </DropdownToggle>
        }
        isOpen={categoryToggled}
        dropdownItems={filterCategoryMenuItems}
        style={{ width: '100%' }}
      ></Dropdown>
    </ToolbarItem>
  );

  const onChangeNameSearchField = (name?: string) => {
    runQuery({
      size: request.size,
      page: 1,
      orderBy: request.orderBy,
      search: {
        ...request.search,
        name,
      },
    });
  };
  const onChangeOwnerSearchField = (owner?: string) => {
    runQuery({
      size: request.size,
      page: 1,
      orderBy: request.orderBy,
      search: {
        ...request.search,
        owner,
      },
    });
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        {filterCategoryDropdown}

        <ToolbarFilter
          chips={statuses.map((v) => stringToChip(v, t))}
          deleteChip={onSelectStatus}
          deleteChipGroup={() => onDeleteQueryGroup('statuses')}
          categoryName={t('status')}
          showToolbarItem={selectedCategory === t('status')}
        >
          <Select
            variant={'checkbox'}
            aria-label={t('status')}
            onToggle={onToggleStatuses}
            onSelect={(_, v) =>
              onSelectStatus('', stringToChip(v as string, t))
            }
            selections={statuses}
            isOpen={statusesToggled}
            placeholderText={t('filterByStatus')}
          >
            {statusMenuItems}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={cloudProviders.map((v) => stringToChip(v, t))}
          deleteChip={onSelectCloudProvider}
          deleteChipGroup={() => onDeleteQueryGroup('cloudProviders')}
          categoryName={t('cloudProvider')}
          showToolbarItem={selectedCategory === t('cloudProvider')}
        >
          <Select
            variant={'checkbox'}
            aria-label={t('cloudProvider')}
            onToggle={onToggleCloudProviders}
            onSelect={(_, v) =>
              onSelectCloudProvider('', stringToChip(v as string, t))
            }
            selections={cloudProviders}
            isOpen={cloudProvidersToggled}
            placeholderText={t('filterByCloudProvider')}
          >
            {cloudProviderMenuItems}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={regions.map((v) => stringToChip(v, t))}
          deleteChip={onSelectRegion}
          deleteChipGroup={() => onDeleteQueryGroup('regions')}
          categoryName={t('region')}
          showToolbarItem={selectedCategory === t('region')}
        >
          <Select
            variant={'checkbox'}
            aria-label={t('region')}
            onToggle={onToggleRegions}
            onSelect={(_, v) =>
              onSelectRegion('', stringToChip(v as string, t))
            }
            selections={regions}
            isOpen={regionsToggled}
            placeholderText={t('filterByRegion')}
          >
            {regionMenuItems}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={name ? [name] : []}
          deleteChip={() => onDeleteQueryGroup('name')}
          categoryName={t('name')}
        >
          {selectedCategory === t('name') && (
            <ToolbarItem>
              <SearchFilter
                filterSelected={selectedCategory}
                placeholder={t('nameSearchPlaceholder')}
                onChangeSearchField={onChangeNameSearchField}
                SearchFieldName={'name'}
              />
            </ToolbarItem>
          )}
        </ToolbarFilter>

        <ToolbarFilter
          chips={owner ? [owner] : []}
          deleteChip={() => onDeleteQueryGroup('owner')}
          categoryName={t('owner')}
        >
          {selectedCategory === t('owner') && (
            <ToolbarItem>
              <SearchFilter
                filterSelected={selectedCategory}
                placeholder={t('ownerSearchPlaceholder')}
                onChangeSearchField={onChangeOwnerSearchField}
                SearchFieldName={'owner'}
              />
            </ToolbarItem>
          )}
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <Button
            variant="primary"
            component="a"
            href="https://console.redhat.com/application-services/streams/kafkas"
            target="_blank"
          >
            {t('createKafkaInstance')}
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <KafkasPagination isCompact />
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

type KeyValueOptions = {
  value: string;
  label: string;
};

// enum InstanceStatus {
//   READY = 'ready',
//   ACCEPTED = 'accepted',
//   PREPARING = 'preparing',
//   PROVISIONING = 'provisioning',
//   FAILED = 'failed',
//   DEPROVISION = 'deprovision',
//   DELETED = 'deleted',
// }

const filterCategoryOptions: KeyValueOptions[] = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'cloudprovider', label: 'Cloud Provider' },
  { value: 'region', label: 'Region' },
  { value: 'owner', label: 'Owner' },
];

const cloudProviderOptions: KeyValueOptions[] = [
  { value: 'aws', label: 'Amazon Web Services' },
];

const statusOptions: KeyValueOptions[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'accepted', label: 'Creation pending' },
  { value: 'provisioning', label: 'Creation in progress' },
  { value: 'preparing', label: 'Creation in progress' },
  { value: 'deprovision', label: 'Deletion in progress' },
];
const regionOptions: KeyValueOptions[] = [
  { value: 'us-east-1', label: 'US East, N. Virginia' },
];

type KafkasPaginationProps = {
  isCompact?: boolean;
};
const KafkasPagination: FunctionComponent<KafkasPaginationProps> = ({
  isCompact = false,
}) => {
  const { request, response, runQuery } = useKafkasMachine();

  return (
    <Pagination
      itemCount={response?.total || 0}
      page={request.page}
      perPage={request.size}
      onChange={(event) =>
        runQuery({ ...event, orderBy: request.orderBy, search: request.search })
      }
      isCompact={isCompact}
    />
  );
};
