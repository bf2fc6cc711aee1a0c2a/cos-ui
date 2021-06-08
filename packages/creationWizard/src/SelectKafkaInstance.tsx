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
  // ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
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
  const { name = '', statuses = [] } = request.query || {};
  const clearAllFilters = useCallback(
    () => onQuery({ page: 1, size: request.size }),
    [onQuery, request.size]
  );

  const searchInputRef = useRef<HTMLInputElement | null>(null);
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

  const onDeleteStatusGroup = () =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        statuses: undefined,
      },
    });
  const [statusesToggled, setStatusesToggled] = useState(false);
  const onToggleStatuses = useCallback(
    () => setStatusesToggled(prev => !prev),
    []
  );

  const statusMenuItems = statusOptions.map(({ value, label }) => (
    <SelectOption key={value} value={value}>
      {label}
    </SelectOption>
  ));

  // ensure the search input value reflects what's specified in the request object
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = name;
    }
  }, [searchInputRef, name]);

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
              debouncedOnQuery({
                size: request.size,
                page: 1,
                query: {
                  name: value,
                  statuses,
                },
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
      <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={statuses}
          deleteChip={onSelectStatus}
          deleteChipGroup={onDeleteStatusGroup}
          categoryName="Status"
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

// const cloudProviderOptions: KeyValueOptions[] = [
//   { value: 'aws', label: 'Amazon Web Services' },
//   // Only aws is supported for now
//   // { value: 'azure', label: 'Microsoft Azure' },
//   // { value: 'baremetal', label: 'Bare Metal' },
//   // { value: 'gcp', label: 'Google Cloud Platform' },
//   // { value: 'libvirt', label: 'Libvirt' },
//   // { value: 'openstack', label: 'OpenStack' },
//   // { value: 'vsphere', label: 'VSphere' },
// ];

const statusOptions: KeyValueOptions[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'accepted', label: 'Creation pending' },
  { value: 'provisioning', label: 'Creation in progress' },
  { value: 'preparing', label: 'Creation in progress' },
  { value: 'deprovision', label: 'Deletion in progress' },
  { value: 'deleted', label: 'Deletion in progress' },
];

// const getCloudProviderDisplayName = (value: string) => {
//   return (
//     cloudProviderOptions.find(option => option.value === value)?.label || value
//   );
// };
