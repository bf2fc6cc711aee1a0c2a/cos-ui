import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateIcon,
  Gallery,
  InputGroup,
  PageSection,
  Pagination,
  // Select,
  // SelectOption,
  Spinner,
  TextInput,
  Title,
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
import { useSelector } from '@xstate/react';
import { KafkaMachineActorRef, PaginatedApiRequest } from '@cos-ui/machines';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useDebounce } from './useDebounce';
import { NoMatchFound } from './NoMatchFound';

export type SelectKafkaInstanceProps = {
  actor: KafkaMachineActorRef;
};

export function SelectKafkaInstance({ actor }: SelectKafkaInstanceProps) {
  const { itemCount, request } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        itemCount: state.context.instances?.total,
        request: state.context.request,
      }),
      [actor]
    )
  );

  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <KafkaToolbar
        itemCount={itemCount}
        request={request}
        onChange={request => actor.send({ type: 'query', ...request })}
      />
      <PageSection isFilled>
        <KafkasGallery actor={actor} />
      </PageSection>
    </PageSection>
  );
}

type KafkaToolbarProps = {
  itemCount?: number;
  request: PaginatedApiRequest;
  onChange: (query: PaginatedApiRequest) => void;
};
const KafkaToolbar: FunctionComponent<KafkaToolbarProps> = ({
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
          <Button variant="primary">Create Kafka Instance</Button>
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

const KafkasGallery: FunctionComponent<SelectKafkaInstanceProps> = ({
  actor,
}) => {
  const { kafkas, selectedId, isLoading } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        kafkas: state.context.instances?.items || [],
        selectedId: state.context.selectedInstance?.id,
        isLoading: state.hasTag('loading'),
      }),
      [actor]
    )
  );
  const onSelect = (selectedInstance: string) => {
    actor.send({ type: 'selectInstance', selectedInstance });
  };

  switch (true) {
    case isLoading:
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );
    case kafkas.length === 0:
      return (
        <NoMatchFound
          onClear={() => actor.send({ type: 'query', page: 1, size: 10 })}
        />
      );
    default:
      return (
        <Gallery hasGutter>
          {kafkas.map(i => (
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
      );
  }
};
