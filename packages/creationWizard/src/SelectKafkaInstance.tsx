import {
  KafkaMachineActorRef,
  PaginatedApiRequest,
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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';

export type WithKafkasMachineActorProp = {
  actor: KafkaMachineActorRef;
};

export function SelectKafkaInstance({ actor }: WithKafkasMachineActorProp) {
  const isReady = useKafkasMachineIsReady(actor);

  return isReady ? <KafkasGallery actor={actor} /> : null;
}

const KafkasGallery: FunctionComponent<WithKafkasMachineActorProp> = ({
  actor,
}) => {
  const history = useHistory();
  const {
    response,
    isFirstRequest,
    isLoading,
    isEmpty,
    hasFilters,
    selectedId,
  } = useKafkasMachine(actor);
  switch (true) {
    case isFirstRequest:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <KafkaToolbar actor={actor} />
          <Loading />
        </PageSection>
      );
    case isEmpty && hasFilters:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <NoMatchFound
            onClear={() => actor.send({ type: 'query', page: 1, size: 10 })}
          />
        </PageSection>
      );
    case isEmpty:
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
    case isLoading:
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <KafkaToolbar actor={actor} />
          <Loading />
        </PageSection>
      );
    default:
      const onSelect = (selectedInstance: string) => {
        actor.send({ type: 'selectInstance', selectedInstance });
      };
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          <KafkaToolbar actor={actor} />
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

const KafkaToolbar: FunctionComponent<WithKafkasMachineActorProp> = ({
  actor,
}) => {
  const { request, response } = useKafkasMachine(actor);

  const onChange = (request: PaginatedApiRequest) =>
    actor.send({ type: 'query', ...request });
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
