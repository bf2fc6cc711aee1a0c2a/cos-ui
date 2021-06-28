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
  useDebounce,
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
import {
  // ExclamationCircleIcon,
  FilterIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
  SyntheticEvent,
} from 'react';
import { useHistory } from 'react-router';

export function SelectKafkaInstance() {
  const actor = useCreationWizardMachineKafkasActor();
  const isReady = useKafkasMachineIsReady(actor);

  return isReady ? <KafkasGallery /> : null;
}

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
  const {
    name = '',
    owner = '',
    statuses = [],
    cloudProviders = [],
    regions = [],
  } = request.query || {};
  const clearAllFilters = useCallback(
    () => onQuery({ page: 1, size: request.size }),
    [onQuery, request.size]
  );

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const ownerInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(onQuery, 1000);
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

  const onSelectStatus = (
    _category: string | ToolbarChipGroup,
    status: string | ToolbarChip
  ) =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        statuses: statuses?.includes(status as string)
          ? statuses.filter(s => s !== status)
          : [...(statuses || []), status as string],
      },
    });

  const onSelectCloudProvider = (
    _category: string | ToolbarChipGroup,
    cloudProvider: string | ToolbarChip
  ) =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        cloudProviders: cloudProviders?.includes(cloudProvider as string)
          ? cloudProviders.filter(s => s !== cloudProvider)
          : [...(cloudProviders || []), cloudProvider as string],
      },
    });

  const onSelectRegions = (
    _category: string | ToolbarChipGroup,
    region: string | ToolbarChip
  ) =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        regions: regions?.includes(region as string)
          ? regions.filter(s => s !== region)
          : [...(regions || []), region as string],
      },
    });

  const onDeleteStatusGroup = () =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        statuses: undefined,
      },
    });
  const onDeleteCloudProviderGroup = () =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        cloudProviders: undefined,
      },
    });
  const onDeleteRegionGroup = () =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        regions: undefined,
      },
    });
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
  const statusMenuItems = statusOptions.map(({ value, label }) => (
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
  // ensure the search input value reflects what's specified in the request object
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = name;
    } else if (ownerInputRef.current) {
      ownerInputRef.current.value = owner;
    }
  }, [nameInputRef, ownerInputRef, name, owner]);

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
          chips={statuses}
          deleteChip={onSelectStatus}
          deleteChipGroup={onDeleteStatusGroup}
          categoryName="Status"
          showToolbarItem={selectedCategory === 'Status'}
        >
          <Select
            variant={'checkbox'}
            aria-label="Status"
            onToggle={onToggleStatuses}
            onSelect={(_, value) => onSelectStatus('', value as string)}
            selections={statuses}
            isOpen={statusesToggled}
            placeholderText="Status"
          >
            {statusMenuItems}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={cloudProviders}
          deleteChip={onSelectCloudProvider}
          deleteChipGroup={onDeleteCloudProviderGroup}
          categoryName="Cloud Provider"
          showToolbarItem={selectedCategory === 'Cloud Provider'}
        >
          <Select
            variant={'checkbox'}
            aria-label="Cloud Provider"
            onToggle={onToggleCloudProviders}
            onSelect={(_, value) => onSelectCloudProvider('', value as string)}
            selections={cloudProviders}
            isOpen={cloudProvidersToggled}
            placeholderText="Cloud Provider"
          >
            {cloudProviderMenuItems}
          </Select>
        </ToolbarFilter>
        <ToolbarFilter
          chips={regions}
          deleteChip={onSelectRegions}
          deleteChipGroup={onDeleteRegionGroup}
          categoryName="Region"
          showToolbarItem={selectedCategory === 'Region'}
        >
          <Select
            variant={'checkbox'}
            aria-label="Region"
            onToggle={onToggleRegions}
            onSelect={(_, value) => onSelectRegions('', value as string)}
            selections={regions}
            isOpen={regionsToggled}
            placeholderText="Region"
          >
            {regionMenuItems}
          </Select>
        </ToolbarFilter>
        {selectedCategory === 'Name' && (
          <InputGroup>
            <TextInput
              name="Name"
              id="Name"
              type="search"
              placeholder="Search by name"
              aria-label="Search by name"
              onChange={value =>
                debouncedOnQuery({
                  size: request.size,
                  page: 1,
                  query: {
                    name: value,
                    statuses,
                  },
                })
              }
              ref={nameInputRef}
            />
            <Button
              variant={'control'}
              aria-label="search button for name input"
            >
              <SearchIcon />
            </Button>
          </InputGroup>
        )}
        {selectedCategory === 'Owner' && (
          <InputGroup>
            <TextInput
              name="Owner"
              id="Owner"
              type="search"
              placeholder="Search by owner"
              aria-label="Search by owner"
              onChange={value =>
                debouncedOnQuery({
                  size: request.size,
                  page: 1,
                  query: {
                    name: value,
                    statuses,
                  },
                })
              }
              ref={ownerInputRef}
            />
            <Button
              variant={'control'}
              aria-label="search button for owner input"
            >
              <SearchIcon />
            </Button>
          </InputGroup>
        )}
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
  // Only aws is supported for now
  { value: 'aws', label: 'Amazon Web Services' },
];

const statusOptions: KeyValueOptions[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'accepted', label: 'Creation pending' },
  { value: 'provisioning', label: 'Creation in progress' },
  { value: 'preparing', label: 'Creation in progress' },
  { value: 'deprovision', label: 'Deletion in progress' },
  { value: 'deleted', label: 'Deletion in progress' },
];
const regionOptions: KeyValueOptions[] = [
  // Only us-east-1 is supported for now
  { value: 'us-east-1', label: 'us-east-1' },
];

// const getCloudProviderDisplayName = (value: string) => {
//   return (
//     cloudProviderOptions.find(option => option.value === value)?.label || value
//   );
// };
