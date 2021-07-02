import {
  useClustersMachine,
  useClustersMachineIsReady,
  useCreationWizardMachineClustersActor,
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
  Pagination,
  TextInput,
  Toolbar,
  ToolbarContent,
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
import React, { FunctionComponent, useRef } from 'react';
import { useHistory } from 'react-router';

export function SelectCluster() {
  const actor = useCreationWizardMachineClustersActor();
  const isReady = useClustersMachineIsReady(actor);

  return isReady ? <ClustersGallery /> : null;
}

const ClustersGallery: FunctionComponent = () => {
  const history = useHistory();
  const actor = useCreationWizardMachineClustersActor();
  const {
    response,
    selectedId,
    loading,
    error,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
    onSelect,
    onQuery,
  } = useClustersMachine(actor);

  switch (true) {
    case firstRequest:
      return (
        <div className={'pf-u-background-color-200'}>
          <Loading />
        </div>
      );
    case queryEmpty:
      return (
        <div className={'pf-u-background-color-200'}>
          <ClustersToolbar />
          <NoMatchFound onClear={() => onQuery({ page: 1, size: 10 })} />
        </div>
      );
    case noResults || error:
      return (
        <div className={'pf-u-background-color-200'}>
          <EmptyState
            emptyStateProps={{ variant: EmptyStateVariant.GettingStarted }}
            titleProps={{ title: 'cos.no_clusters_instance' }}
            emptyStateBodyProps={{
              body: 'cos.no_clusters_instance_body',
            }}
            buttonProps={{
              title: 'cos.create_clusters_instance',
              variant: ButtonVariant.primary,
              onClick: () => history.push('/create-connector'),
            }}
          />
        </div>
      );
    case loading:
      return (
        <div className={'pf-u-background-color-200'}>
          <ClustersToolbar />
          <Loading />
        </div>
      );
    default:
      return (
        <div className={'pf-u-background-color-200'}>
          <ClustersToolbar />
          <div className={'pf-u-p-md'}>
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
                    <CardTitle>{i.metadata?.name}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Owner</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.metadata?.owner}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.metadata?.created_at}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              ))}
            </Gallery>
          </div>
        </div>
      );
  }
};

const ClustersToolbar: FunctionComponent = () => {
  const actor = useCreationWizardMachineClustersActor();
  const { request, response, onQuery } = useClustersMachine(actor);

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
              debouncedOnQuery({
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
          <Button variant="primary">Create Clusters Instance</Button>
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
      // clearAllFilters={clearAllFilters}
    >
      <ToolbarContent>{toolbarItems}</ToolbarContent>
    </Toolbar>
  );
};
