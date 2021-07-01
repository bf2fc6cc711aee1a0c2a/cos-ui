import {
  useCreationWizardMachineKafkasActor,
  useKafkasMachine,
  useKafkasMachineIsReady,
} from '@cos-ui/machines';
import {
  EmptyState,
  EmptyStateVariant,
  Loading,
  NoMatchFound,
} from '@cos-ui/utils';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Gallery,
  InputGroup,
  PageSection,
  Pagination,
  Select,
  SelectOption,
  TextInput,
  Toolbar,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownPosition,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, {
  FunctionComponent,
  useCallback,
  useRef,
  useState,
  SyntheticEvent,
} from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
export function SelectKafkaInstance() {
  const actor = useCreationWizardMachineKafkasActor();
  const isReady = useKafkasMachineIsReady(actor);

  return isReady ? <KafkasGallery /> : null;
}
export type FilterValue = {
  value: string;
};
export type FilterType = {
  filterKey: string;
  filterValue: FilterValue[];
};
const KafkasGallery: FunctionComponent = () => {
  const history = useHistory();
  const actor = useCreationWizardMachineKafkasActor();
  const {
    response,
    loading,
    error,
    selectedId,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
    onSelect,
    onQuery,
  } = useKafkasMachine(actor);

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
          <KafkaToolbar />
          <NoMatchFound onClear={() => onQuery({ page: 1, size: 10 })} />
        </PageSection>
      );
    case noResults || error:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <EmptyState
            emptyStateProps={{ variant: EmptyStateVariant.GettingStarted }}
            titleProps={{ title: 'cos.no_kafka_instance' }}
            emptyStateBodyProps={{
              body: 'cos.no_kafka_instance_body',
            }}
            buttonProps={{
              title: 'cos.create_kafka_instance',
              variant: ButtonVariant.primary,
              onClick: () => history.push('/create-connector'),
            }}
          />
        </PageSection>
      );
    case loading:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <KafkaToolbar />
          <Loading />
        </PageSection>
      );
    default:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <KafkaToolbar />
          <PageSection isFilled>
            <Gallery hasGutter>
              {response?.items?.map(i => (
                <Card
                  isHoverable
                  key={i.id}
                  isSelectable
                  isSelected={selectedId === i.id}
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
};

const KafkaToolbar: FunctionComponent = () => {
  const actor = useCreationWizardMachineKafkasActor();
  const { request, response, onQuery } = useKafkasMachine(actor);
  const [statusesToggled, setStatusesToggled] = useState(false);
  const [cloudProvidersToggled, setCloudProvidersToggled] = useState(false);
  const [regionsToggled, setRegionsToggled] = useState(false);
  const [categoryToggled, setCategoryToggled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Name');
  const [nameFilter, setNameFilter] = useState<string | undefined>();
  const [ownerFilter, setOwnerFilter] = useState<string | undefined>();
  const [filteredValue, setFilteredValue] = useState<Array<FilterType>>([]);
  const { t } = useTranslation();

  const clearAllFilters = useCallback(() => {
    onQuery({ page: 1, size: request.size });
    setFilteredValue([]);
  }, [onQuery, request.size]);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const ownerInputRef = useRef<HTMLInputElement | null>(null);

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
  const updateFilter = (
    key: string,
    filter: FilterValue,
    removeIfPresent: boolean
  ) => {
    const newFilterValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilterValue.findIndex(f => f.filterKey === key);
    if (filterIndex > -1) {
      const filterValue = newFilterValue[filterIndex];
      if (filterValue.filterValue && filterValue.filterValue.length > 0) {
        const filterValueIndex = filterValue.filterValue.findIndex(
          f => f.value === filter.value
        );
        if (filterValueIndex > -1) {
          if (removeIfPresent) {
            filterValue.filterValue.splice(filterValueIndex, 1);
          } else {
            return;
          }
        } else {
          newFilterValue[filterIndex].filterValue.push(filter);
        }
      } else {
        newFilterValue[filterIndex].filterValue = [filter];
      }
    } else {
      newFilterValue.push({ filterKey: key, filterValue: [filter] });
    }
    setFilteredValue(newFilterValue);
    const currentFilterValue = newFilterValue.reduce((acc, obj) => {
      const { filterKey: key, filterValue: value } = obj;
      return { ...acc, [key]: value.map(o => o.value) };
    }, {});
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        ...currentFilterValue,
      },
    });
  };
  const onFilter = (filterType: string) => {
    if (filterType === 'name' && nameFilter) {
      updateFilter('name', { value: nameFilter }, false);
      setNameFilter('');
    } else if (filterType === 'owner' && ownerFilter) {
      updateFilter('owner', { value: ownerFilter }, false);
      setOwnerFilter('');
    }
  };
  const getSelectionForFilter = (key: string) => {
    const selectedFilters = filteredValue?.filter(
      filter => filter.filterKey === key
    );

    if (selectedFilters?.length > 0) {
      return selectedFilters[0]?.filterValue.map(val => val.value);
    }
    return [];
  };

  const onDeleteChip = (
    category: string,
    chip: string | ToolbarChip,
    filterOptions?: Array<any>
  ) => {
    let newFilteredVal: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredVal.findIndex(
      filter => filter.filterKey === category
    );
    const prevFilterValue: FilterValue[] = Object.assign(
      [],
      newFilteredVal[filterIndex]?.filterValue
    );
    let filterChip: string | undefined = chip.toString();
    if (filterOptions && filterOptions?.length > 0) {
      filterChip = filterOptions?.find(
        option => option.label === chip.toString()
      )?.value;
    }
    const chipIndex = prevFilterValue.findIndex(
      val => val.value === filterChip
    );
    if (chipIndex >= 0) {
      newFilteredVal[filterIndex].filterValue.splice(chipIndex, 1);
      setFilteredValue(newFilteredVal);
      const currentFilterValue = newFilteredVal.reduce((acc, obj) => {
        const { filterKey: key, filterValue: value } = obj;
        return { ...acc, [key]: value.map(o => o.value) };
      }, {});
      onQuery({
        ...request,
        query: {
          ...(request.query || {}),
          ...currentFilterValue,
        },
      });
    }
  };
  const onDeleteChipGroup = (category: string) => {
    const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredValue.findIndex(
      filter => filter.filterKey === category
    );
    if (filterIndex >= 0) {
      newFilteredValue.splice(filterIndex, 1);
      setFilteredValue(newFilteredValue);
    }
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        [category]: undefined,
      },
    });
  };
  const onNameFilterChange = (value?: string) => {
    setNameFilter(value || '');
  };
  const onOwnerFilterChange = (value?: string) => {
    setOwnerFilter(value);
  };
  const onSelectStatus = (
    _category: string | ToolbarChipGroup,
    status: string | ToolbarChip
  ) => {
    updateFilter('statuses', { value: status.toString() }, true);
  };
  const onSelectCloudProvider = (
    _category: string | ToolbarChipGroup,
    cloudProvider: string | ToolbarChip
  ) => {
    updateFilter('cloudProviders', { value: cloudProvider.toString() }, true);
  };
  const onSelectRegions = (
    _category: string | ToolbarChipGroup,
    region: string | ToolbarChip
  ) => {
    updateFilter('regions', { value: region.toString() }, true);
  };

  const onToggleStatuses = useCallback(
    () => setStatusesToggled(prev => !prev),
    []
  );
  const onToggleCloudProviders = useCallback(
    () => setCloudProvidersToggled(prev => !prev),
    []
  );
  const onToggleRegions = useCallback(
    () => setRegionsToggled(prev => !prev),
    []
  );
  const onFilterCategoryToggle = useCallback(
    () => setCategoryToggled(prev => !prev),
    []
  );

  const selectCategory = useCallback(
    (event?: SyntheticEvent<HTMLDivElement, Event> | undefined) => {
      const eventTarget = event?.target as HTMLElement;
      const selectedCategory = eventTarget.innerText;
      setSelectedCategory(selectedCategory);
      setCategoryToggled(prev => !prev);
    },
    []
  );
  const filterCategoryMenuItems = filterCategoryOptions.map(
    ({ value, label }) => <DropdownItem key={value}>{label}</DropdownItem>
  );
  const statusMenuItems = statusOptions
    .filter(option => option.value !== 'preparing')
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
        onSelect={event => selectCategory(event)}
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

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        {filterCategoryDropdown}

        <ToolbarFilter
          chips={getSelectionForFilter('statuses')?.map(status => t(status))}
          deleteChip={(_category, chip) =>
            onDeleteChip('statuses', chip, statusOptions)
          }
          deleteChipGroup={() => onDeleteChipGroup('statuses')}
          categoryName={t('status')}
          showToolbarItem={selectedCategory === t('status')}
        >
          <Select
            variant={'checkbox'}
            aria-label={t('status')}
            onToggle={onToggleStatuses}
            onSelect={(_, value) => onSelectStatus('', value as string)}
            selections={getSelectionForFilter('statuses')}
            isOpen={statusesToggled}
            placeholderText={t('status')}
          >
            {statusMenuItems}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={getSelectionForFilter('cloudProviders')?.map(cloudProvider =>
            t(cloudProvider)
          )}
          deleteChip={(_category, chip) =>
            onDeleteChip('cloudProviders', chip, cloudProviderOptions)
          }
          deleteChipGroup={() => onDeleteChipGroup('cloudProviders')}
          categoryName={t('CloudProvider')}
          showToolbarItem={selectedCategory === t('CloudProvider')}
        >
          <Select
            variant={'checkbox'}
            aria-label={t('CloudProvider')}
            onToggle={onToggleCloudProviders}
            onSelect={(_, value) => onSelectCloudProvider('', value as string)}
            selections={getSelectionForFilter('cloudProviders')}
            isOpen={cloudProvidersToggled}
            placeholderText={t('CloudProvider')}
          >
            {cloudProviderMenuItems}
          </Select>
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('regions')?.map(region => t(region))}
          deleteChip={(_category, chip) =>
            onDeleteChip('regions', chip, regionOptions)
          }
          deleteChipGroup={() => onDeleteChipGroup('regions')}
          categoryName={t('region')}
          showToolbarItem={selectedCategory === t('region')}
        >
          <Select
            variant={'checkbox'}
            aria-label={t('region')}
            onToggle={onToggleRegions}
            onSelect={(_, value) => onSelectRegions('', value as string)}
            selections={getSelectionForFilter('regions')}
            isOpen={regionsToggled}
            placeholderText={t('region')}
          >
            {regionMenuItems}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={getSelectionForFilter('name')}
          deleteChip={(_category, chip) => onDeleteChip('name', chip)}
          deleteChipGroup={() => onDeleteChipGroup('name')}
          categoryName={t('name')}
        >
          {selectedCategory === t('name') && (
            <ToolbarItem>
              <InputGroup>
                <TextInput
                  name={t('name')}
                  id={t('name')}
                  type="search"
                  placeholder={t('nameSearchPlaceholder')}
                  aria-label={t('nameSearchPlaceholder')}
                  onChange={value => onNameFilterChange(value)}
                  value={nameFilter || ''}
                  ref={nameInputRef as React.RefObject<HTMLInputElement>}
                />
                <Button
                  variant={'control'}
                  aria-label="search button for name input"
                  onClick={() => onFilter('name')}
                >
                  <SearchIcon />
                </Button>
              </InputGroup>
            </ToolbarItem>
          )}
        </ToolbarFilter>

        <ToolbarFilter
          chips={getSelectionForFilter('owner')}
          deleteChip={(_category, chip) => onDeleteChip('owner', chip)}
          deleteChipGroup={() => onDeleteChipGroup('owner')}
          categoryName={t('owner')}
        >
          {selectedCategory === t('owner') && (
            <ToolbarItem>
              <InputGroup>
                <TextInput
                  name={t('owner')}
                  id={t('owner')}
                  type="search"
                  placeholder={t('ownerSearchPlaceholder')}
                  aria-label={t('ownerSearchPlaceholder')}
                  onChange={value => onOwnerFilterChange(value)}
                  value={ownerFilter || ''}
                  ref={ownerInputRef as React.RefObject<HTMLInputElement>}
                />
                <Button
                  variant={'control'}
                  aria-label="search button for owner input"
                  onClick={() => onFilter('owner')}
                >
                  <SearchIcon />
                </Button>
              </InputGroup>
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
          <Button variant="primary">Create Kafka Instance</Button>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <Pagination
          itemCount={response?.total || 0}
          page={request.page}
          perPage={request.size}
          perPageOptions={defaultPerPageOptions}
          onSetPage={(_, page, size) =>
            onQuery({ ...request, page, size: size || request.size })
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
